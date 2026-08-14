import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { StartSubmissionDTO } from './dto/start-submission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaveAnswerDTO, SyncAnswerDto } from './dto/save-answers,dto';
import { SubmissionRepository } from './repository/submissions.repository';
import { AssessmentRepository } from 'src/assessment/repository/assessment.repository';
import { AnswerRepository } from './repository/answer.repository';
import { QuestionRepository } from './repository/question.repository';
import { error } from 'console';
import { SubmissionsGateway } from './submissions.gateway';
import { RedisBufferService } from 'src/shared/redis/redis.buffer.service';
import { I_SESSION_GATEWAY, ISessionGateway } from './ports/session.gateway.port';
import { I_SUBMISSION_REPOSITORY, ISubmissionRepository } from './ports/submission.repository.port';
import { SubmissionDomain, SubmissionDomainError, SubmissionTimeoutError } from './entities/submission.entity';


@Injectable()
export class SubmissionsService {
  constructor(
    private prisma: PrismaService,
    // private submissionRepo: SubmissionRepository,
    private assessmentrepo: AssessmentRepository,
    private answerRepo: AnswerRepository,
    private questionRepo: QuestionRepository,
    private readonly submissionsGateway: SubmissionsGateway,
    private readonly redisBuffer: RedisBufferService,
    
    @Inject(I_SUBMISSION_REPOSITORY)
    private readonly isubmissionRepo: ISubmissionRepository,

    @Inject(I_SESSION_GATEWAY) 
    private readonly isessionGateway: ISessionGateway, // 👈 Gateway beraksi!
  ) {}

  // Pastikan DTO Anda menerima 'class_name' (String), bukan 'class_id'
  async startSubmission(dto: StartSubmissionDTO, assessmentId: string, sessionId: string) {
    if (!dto.student_name || !dto.class_id) {
      throw new BadRequestException('Data siswa tidak lengkap');
    }

    // 1. Dapatkan Sesi dari Gateway (Pencarian spesifik by ID)
    const sessionInfo = await this.isessionGateway.getSession(sessionId);
    
    if (!sessionInfo) throw new NotFoundException('Sesi ujian tidak ditemukan');

    // 2. Cari apakah siswa ini sudah pernah masuk (Resume Ujian)
    // Ingat, pencarian sekarang pakai class_id, bukan class_name
    let submission = await this.isubmissionRepo.findDomainByStudent(assessmentId, dto.student_name, dto.class_name);
    
    // 3. Jika belum ada, buat baru
    if (!submission) {
      submission = SubmissionDomain.createNew(dto, assessmentId, sessionId);
    }

    // 4. 🔥 SANG BOUNCER BERAKSI: Menendang keluar jika kelas tidak sesuai atau waktu habis
    submission.validateEligibilityToStart(sessionInfo);

    // 5. Simpan ke Database
    const savedSubmission = await this.isubmissionRepo.createSubmission(
      assessmentId, 
      dto.student_name, 
      dto.class_id,   // Kirim class_id ke repo
      dto.class_name, 
      dto.gender,
      sessionId       // WAJIB diikat ke Session
    );

    return {
      submission_id: savedSubmission.id,
      deadline: sessionInfo.endTime,
    };
  }

  async getTimer(assessmentId: string, sessionId: string) {
    const assessment = await this.assessmentrepo.findOneAssessmentById(assessmentId);

    if (!assessment) {
      throw new NotFoundException('Assessment tidak ditemukan');
    }
    console.log('assessment: ', assessment);

    if (assessment.assessment_status === 'DRAFT') {
      throw new ForbiddenException('Assessment belum dibuka (DRAFT)');
    }
    
    // Pastikan ujian sudah di-publish
    const sessionInfo = await this.isessionGateway.getSession(sessionId);
    if (!sessionInfo) {
      throw new ForbiddenException('Sesi ujian tidak ditemukan atau belum dijadwalkan.');
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
    const submissionDomain = await this.isubmissionRepo.findSubmissionNAssessmentDeadline(submissionId); 
    if (!submissionDomain) throw new NotFoundException("Submission tidak ditemukan");

    if (!submissionDomain.sessionId) {
      throw new BadRequestException("Data ujian korup: Sesi tidak ditemukan pada lembar jawaban ini.");
    }

    // 2. Ambil Soal
    const question = await this.questionRepo.findUniqueQuestion(dto.question_id);
    if (!question) throw new NotFoundException("Pertanyaan tidak valid");

    // 3. Ambil Info Sesi via Gateway (Sangat cepat karena nge-hit Cache Redis)
    const sessionInfo = await this.isessionGateway.getSession(submissionDomain.sessionId);
    
    if (!sessionInfo) {
      throw new NotFoundException("Sesi ujian tidak ditemukan atau telah dihapus dari sistem.");
    }

    try {
      submissionDomain.validateCanAnswer(
        question.assessment_id, 
        new Date(sessionInfo.endTime) 
      );
    } catch (error) {
      if (error instanceof SubmissionTimeoutError) {
         // 🔥 BUNGKUS DENGAN TRY-CATCH AGAR TIDAK MERUSAK RESPONSE
         try {
           await this.finish(submissionId,submissionDomain.sessionId); 
         } catch (finishErr: any) {
           console.error("Gagal melakukan auto-finish:", finishErr.message);
         }
         
         // 🔥 KEMBALIKAN KE BAD REQUEST (400) AGAR SESUAI DENGAN E2E ANDA SAAT INI
         throw new BadRequestException(error.message);
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

  async finish(submissionId: string, sessionId: string) {
    // 1. FASE GATHERING & INFRA SYNC
    const submissionDomain = await this.isubmissionRepo.findSubmissionById(submissionId);
    if (!submissionDomain) throw new NotFoundException('Submission tidak ditemukan');

    // 🔄 Paksa sinkronisasi Redis -> Postgres untuk memastikan integritas
    await this.flushRedisAnswersToDatabase(submissionId);

    // Ambil Info Sesi via Gateway (BUKAN DARI ASSESSMENT REPO)
    const sessionInfo = await this.isessionGateway.getSession(sessionId);
    
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
    return await this.isubmissionRepo.updateStatusFinishSubmission(submissionId, totalScore);
  }


  async getUniqueSubmissionWithQuestions(submissionId: string) {
    return await this.isubmissionRepo.findOneSubmissionWithQuestion(submissionId);
  }

  async forceCloseTimeouts(assessmentId: string) {

    // 1. Service hanya meminta data lewat antarmuka
    const stuckSubmissions = await this.isubmissionRepo.findStuckSubmissions(assessmentId);

    const now = new Date();
    let closedCount = 0;

    // Keranjang mulai dibuat...
    const updatePromises = stuckSubmissions.map(async (sub) => {
      // 2. Validasi ke Session
      if (!sub.session || !sub.session.end_time) {
        throw new BadRequestException(`Sesi ujian tidak valid untuk submission ${sub.id}`);
      }
      
      const deadline = sub.session.end_time;

      // Cek apakah sudah lewat waktu
      if (now.getTime() > deadline.getTime()) {
        
        // 3. Hitung Skor
        let totalScore = 0;
        sub.answer.forEach(ans => {
          totalScore += ans.option?.score ?? 0;
        });

        closedCount++;

        // 4. Perintahkan repositori untuk update (RETURN janjinya!)
        return this.isubmissionRepo.forceFinishSubmission(sub.id, totalScore);
      }
    });

    // Eksekusi semua secara paralel
    await Promise.all(updatePromises);
    
    return { closed_count: closedCount };
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
    const submissionDomain = await this.isubmissionRepo.findOneIdSubmissionWithAnswer(submissionId);
    
    if (!submissionDomain) throw new NotFoundException('Gagal memuat data jawaban.');

    // 🔥 Biarkan Domain yang berhitung
    return submissionDomain.calculateTotalScore();
  }
}

