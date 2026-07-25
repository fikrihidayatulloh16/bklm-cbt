import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { StartSubmissionDTO } from './dto/start-submission.dto';
import { SaveAnswerDTO, SyncAnswerDto } from './dto/save-answers,dto';
import { AssessmentRepository } from 'src/assessment/repository/assessment.repository';
import { AnswerRepository } from './repository/answer.repository';
import { QuestionRepository } from './repository/question.repository';
import { error } from 'console';
import { SubmissionsGateway } from './submissions.gateway';
import { RedisBufferService } from 'src/shared/redis/redis.buffer.service';
import { IAssessmentSessionRepository } from 'src/assessment-session/ports/assessment-session.repository.port';
import { SubmissionDomain, SubmissionDomainError, SubmissionTimeoutError } from './submission.domain';
import { I_SESSION_GATEWAY, ISessionGateway } from './ports/session.gateway.port';
import { I_SUBMISSION_REPOSITORY, ISubmissionRepository } from './ports/submission.repository.port';
import { SubmissionMapper } from './mapper/submission.mapper';

@Injectable()
export class SubmissionsService {
  constructor(
    private assessmentrepo: AssessmentRepository,
    private answerRepo: AnswerRepository,
    private questionRepo: QuestionRepository,
    private readonly submissionsGateway: SubmissionsGateway,
    private readonly redisBuffer: RedisBufferService,

    @Inject(I_SUBMISSION_REPOSITORY)
    private readonly submissionRepo: ISubmissionRepository,

    @Inject(I_SESSION_GATEWAY) 
    private readonly sessionGateway: ISessionGateway, // 👈 Gateway beraksi!
  ) {}

  async startSubmission(dto: StartSubmissionDTO, assessmentId: string, sessionId: string) {
    if (!dto.student_name || !dto.class_name) {
      throw new BadRequestException('Data siswa tidak lengkap');
    }

    // ✅ Memperbaiki Error: getSessionById tidak ada, diganti dengan kontrak Gateway
    const sessionInfo = await this.sessionGateway.getSession(assessmentId); 
    if (!sessionInfo) throw new NotFoundException('Sesi ujian tidak ditemukan');

    let submission = await this.submissionRepo.findDomainByStudent(assessmentId, dto.student_name, dto.class_name);
    
    if (!submission) {
      submission = SubmissionDomain.createNew(dto, assessmentId, sessionId);
    }

    submission.validateEligibilityToStart(sessionInfo);

    const savedSubmission = await this.submissionRepo.createSubmission(assessmentId, dto.student_name, dto.class_name, dto.gender

    );

    return {
      submission_id: savedSubmission.id,
      deadline: sessionInfo.endTime,
    };
  }

  async getTimer(assessmentId: string) {
    const assessment = await this.assessmentrepo.findOneAssessmentById(assessmentId);

    if (!assessment) {
      throw new NotFoundException('Assessment tidak ditemukan');
    }

    // Pastikan ujian sudah di-publish
    const sessionInfo = await this.sessionGateway.getSession(assessmentId);
    if (!sessionInfo) {
      throw new ForbiddenException('Assessment belum dibuka (DRAFT)');
    }
    
    const now = new Date();
    const deadline = sessionInfo.endTime; // Deadline adalah Jam 11:00 (Fixed)

    // RUMUS BENAR: Deadline - Sekarang = Sisa Waktu
    // Contoh: 11:00 - 10:55 = 5 Menit (300.000 ms)
    let remainingMs = deadline.getTime() - now.getTime();

    // Jika waktu minus (sudah lewat deadline), set jadi 0
    if (remainingMs < 0) remainingMs = 0;

    return {
        // Kirim deadline absolut (Jam 11:00) untuk react-countdown
        deadline_date: deadline, 
        
        // Kirim sisa milidetik (opsional, untuk validasi logic)
        remaining_ms: remainingMs 
    };
  }

  async saveAnswer(submissionId: string, dto: SaveAnswerDTO) {
    // 1. Ambil Domain Submission
    const submissionDomain = await this.submissionRepo.findSubmissionNAssessmentDeadline(submissionId); 
    if (!submissionDomain) throw new NotFoundException("Submission tidak ditemukan");

    // 2. Ambil Soal
    const question = await this.questionRepo.findUniqueQuestion(dto.question_id);
    if (!question) throw new NotFoundException("Pertanyaan tidak valid");

    // 3. Ambil Info Sesi via Gateway (Sangat cepat karena nge-hit Cache Redis)
    const sessionInfo = await this.sessionGateway.getSession(submissionDomain.assessmentId);

    // 4. FASE DOMAIN LOGIC
    try {
      submissionDomain.validateCanAnswer(
        question.assessment_id, 
        sessionInfo?.endTime // 💡 Oper waktu dari Sesi
      );
    } catch (error) {
      if (error instanceof SubmissionTimeoutError) {
         await this.finish(submissionId); 
         throw new ForbiddenException(error.message);
      }
      if (error instanceof SubmissionDomainError) {
         throw new BadRequestException(error.message);
      }
      throw error;
    }

    // 3. FASE INFRASTRUKTUR (Heavy Write Optimasi)
    try {
        const redisKey = `cbt:answers:${submissionId}`;
        const redisValue = {
          text_value: dto.text_value,
          numeric_value: dto.numeric_value,
          option_id: dto.option_id,
        };

        // Simpan ke Redis Hash
        await this.redisBuffer.setHash(redisKey, dto.question_id, redisValue);

        return {
          submission_id: submissionId,
          ...dto
        };
    } catch (error) {
        throw new BadRequestException("Gagal mengamankan jawaban ke buffer.");
    }
  }

  async finish(submissionId: string) {
    // 1. FASE GATHERING & INFRA SYNC
    const submissionDomain = await this.submissionRepo.findSubmissionById(submissionId);
    if (!submissionDomain) throw new NotFoundException('Submission tidak ditemukan');

    // 🔄 Paksa sinkronisasi Redis -> Postgres untuk memastikan integritas
    await this.flushRedisAnswersToDatabase(submissionId);

    // Ambil Info Sesi via Gateway (BUKAN DARI ASSESSMENT REPO)
    const sessionInfo = await this.sessionGateway.getSession(submissionDomain.assessmentId);
    
    // Ambil metrik soal
    const totalAnswered = await this.answerRepo.totalAnswered(submissionId);
    const totalQuestion = await this.questionRepo.totalAnswered(submissionDomain.assessmentId);

    // 2. FASE DOMAIN LOGIC
    try {
      submissionDomain.validateCanFinish(
        sessionInfo?.endTime, 
        totalAnswered, 
        totalQuestion
      );
    } catch (error) {
      if (error instanceof SubmissionDomainError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    // 3. FASE KALKULASI & FINALISASI
    const totalScore = await this.calculateFinalScore(submissionId);

    const socketPayload = {
        id: submissionId,
        status: 'FINISHED',
        score: totalScore,
        submitted_at: new Date(),
    };

    this.submissionsGateway.notifySubmissionFinished(socketPayload);
    return await this.submissionRepo.updateStatusFinishSubmission(submissionId, totalScore);
  }

  async getUniqueSubmissionWithQuestions(submissionId: string) {
    return await this.submissionRepo.findOneSubmissionWithQuestion(submissionId);
  }
  
  private async flushRedisAnswersToDatabase(submissionId: string): Promise<void> {
    const bufferedData = await this.redisBuffer.harvestPattern(`cbt:answers:${submissionId}`);
    if (bufferedData.length === 0) return;

    const answersToSync: SyncAnswerDto[] = [];
    for (const item of bufferedData) {
      for (const [questionId, rawJsonStr] of Object.entries(item.data)) {
        const answerObj = JSON.parse(rawJsonStr);
        answersToSync.push({
          submission_id: submissionId,
          question_id: questionId,
          text_value: answerObj.text_value,
          numeric_value: answerObj.numeric_value,
          option_id: answerObj.option_id,
        });
      }
    }
    // Tembak massal ke DB
    await this.answerRepo.bulkUpsertAnswers(answersToSync);
  }

  private async calculateFinalScore(submissionId: string): Promise<number> {
    // Pastikan findOneIdSubmissionWithAnswer di Repository sudah menggunakan Mapper!
    const submissionDomain = await this.submissionRepo.findOneIdSubmissionWithAnswer(submissionId);
    
    if (!submissionDomain) throw new NotFoundException('Gagal memuat data jawaban.');

    // 🔥 Biarkan Domain yang berhitung
    return submissionDomain.calculateTotalScore();
  }
}
