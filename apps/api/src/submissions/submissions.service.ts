import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class SubmissionsService {
  constructor(
    private prisma: PrismaService,
    private submissionRepo: SubmissionRepository,
    private assessmentrepo: AssessmentRepository,
    private answerRepo: AnswerRepository,
    private questionRepo: QuestionRepository,
    private readonly submissionsGateway: SubmissionsGateway,
    private readonly redisBuffer: RedisBufferService,
  ) {}

  // Pastikan DTO Anda menerima 'class_name' (String), bukan 'class_id'
  async startSubmission(dto: StartSubmissionDTO, assessment_id: string,submission_id?: string) {

    const assessment = await this.assessmentrepo.findOneAssessmentById(assessment_id)

    const existing = await this.submissionRepo.findExistingStudent(assessment_id, dto.student_name, dto.class_name)

    if ( existing ) {
      if (existing.status === "FINISHED") {
        throw new ForbiddenException("Anda sudah menyelesaikan ujian ini.")
      } else {
        return existing
      }
    }

    if (submission_id != null) {
      const submision = await this.submissionRepo.findOneIdSubmissionWithAnswer(submission_id)
      const submisionStatus = await this.submissionRepo.findSubmissionById(submission_id)

      //validasi apakah submission sudah finish jika sudah finish kirim throw
      if ( submisionStatus?.status === 'FINISHED') {
        throw new ForbiddenException("Submission sudah selesai dilakukan")
      }

      //validasi apakah submission sebelumnya sudah ada, jika ada lanjut
      if (submision?.id === submission_id) {
        return {
          submission_id: submision?.id,
          student_name: submision?.student_name,
          deadline:  assessment?.expired_at// atau assessment.expired_at
        }
      }
    }

    // Memeriksa apakah assessment ada
    if(!assessment) {
      throw new NotFoundException('Assessment not found!')
    }

    //Memastikan Bahwa Assessment dibuka atau belum kadaluwarsa
    if (!assessment.expired_at) {
      throw new ForbiddenException('Assessment ini Tidak/Belum Dibuka, silahkan hubungi/Tunggu Guru yang bersangkutan')
    }

    const deadLine = assessment.expired_at.getTime()
    const now = new Date().getTime()
    
    if (deadLine < now) {
       throw new ForbiddenException('Waktu ujian sudah habis! Anda terlambat.');
    }

    const newSubmission = await this.submissionRepo.createSubmission(dto, assessment_id);

    const socketPayload = {
      id: newSubmission.id,
      student_name: newSubmission.student_name, // Pastikan query include student
      class_name: newSubmission.class_name,
      // deadline: newSubmission.deadline,
      status: "IN_PROGRESS",
      score: 0,
      submitted_at: null
    };

    console.log("🚀 Emitting WebSocket Event:", socketPayload); // Log biar kelihatan di terminal
    this.submissionsGateway.notifyNewSubmission(socketPayload);

    return {
      submission_id: newSubmission.id,
      student_name: newSubmission.student_name,
      class_name: newSubmission.class_name,

      // Kirim 'expired_at' milik Assessment sebagai deadline siswa
        deadline: assessment.expired_at
    };
  }

  async getTimer(assessmentId: string) {
    const assessment = await this.assessmentrepo.findOneAssessmentById(assessmentId);

    if (!assessment) {
      throw new NotFoundException('Assessment tidak ditemukan');
    }

    // Pastikan ujian sudah di-publish
    if (!assessment.expired_at) {
      throw new ForbiddenException('Assessment belum dibuka (DRAFT)');
    }
    
    const now = new Date();
    const deadline = assessment.expired_at; // Deadline adalah Jam 11:00 (Fixed)

    // RUMUS BENAR: Deadline - Sekarang = Sisa Waktu
    // Contoh: 11:00 - 10:55 = 5 Menit (300.000 ms)
    let remainingMs = deadline.getTime() - now.getTime();

    // Jika waktu minus (sudah lewat deadline), set jadi 0
    if (remainingMs < 0) remainingMs = 0;

    return {
        // Kirim deadline absolut (Jam 11:00) untuk react-countdown
        deadline_date: assessment.expired_at, 
        
        // Kirim sisa milidetik (opsional, untuk validasi logic)
        remaining_ms: remainingMs 
    };
  }

  async saveAnswer(submissionId: string, dto: SaveAnswerDTO) {
    // 1. Ambil Submission SEKALIGUS Deadline Assessment (Optimasi Query)
    const submission = await this.submissionRepo.findSubmissionNAssessmentDeadline(submissionId); 
    
    if (!submission) throw new NotFoundException("Submission tidak ditemukan");
    if (submission.status === 'FINISHED') throw new ForbiddenException("Ujian sudah ditutup.");

    // 2. Validasi Soal (Wrong Room Prevention)
    const question = await this.questionRepo.findUniqueQuestion(dto.question_id);
    if (!question) throw new NotFoundException("Pertanyaan tidak valid");
    if (question.assessment_id !== submission.assessment_id) {
        throw new BadRequestException("Pertanyaan ini bukan bagian dari ujian ini!");
    }

    // 3. Validasi Waktu
    const now = new Date();
    const expiredAt = submission.assessment?.expired_at; 

    if (!expiredAt) {
        console.error(`Assessment ID ${submission.assessment_id} tidak punya expired_at`);
        throw new BadRequestException('Konfigurasi waktu ujian invalid');
    }

    const GRACE_PERIOD_MS = 2 * 60 * 1000;
    if (now.getTime() > (expiredAt.getTime() + GRACE_PERIOD_MS)) {
         this.finish(submissionId);
         throw new ForbiddenException("Waktu ujian telah habis! Jawaban tidak tersimpan.");
    }

    // 🚀 [OPTIMASI UTAMA]: Alihkan Tembakan dari PostgreSQL ke Redis
    try {
        const redisKey = `cbt:answers:${submissionId}`;
        const redisValue = {
          text_value: dto.text_value,
          numeric_value: dto.numeric_value,
          option_id: dto.option_id,
        };

        // Simpan ke Redis (Selesai dalam hitungan mikrodetik, DB bernapas lega)
        await this.redisBuffer.setHash(redisKey, dto.question_id, redisValue);

        // Kembalikan struktur data simulated agar tidak merusak kontrak dengan Frontend
        return {
          submission_id: submissionId,
          ...dto
        };
    } catch (error) {
        throw new BadRequestException("Gagal mengamankan jawaban ke buffer.");
    }
  }

  async finish(submissionId: string) {
    // 1. Ambil Data Submission
    const submission = await this.submissionRepo.findSubmissionById(submissionId);
    if (!submission) throw new ForbiddenException('Submission tidak ditemukan');
    if (submission.status === 'FINISHED') throw new BadRequestException(`Submission sudah selesai.`);

    // 🔄 🔥 [PENYELAMAT INTEGRITAS DATA]: Paksa Sinkronisasi Instan Khusus Siswa Ini
    // Kita panen hanya kunci milik submission ini saja dari Redis
    const bufferedData = await this.redisBuffer.harvestPattern(`cbt:answers:${submissionId}`);
    
    if (bufferedData.length > 0) {
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
      
      // Tembak langsung secara massal lewat komitmen repository baru Anda
      await this.answerRepo.bulkUpsertAnswers(answersToSync);
    }

    // 2. Ambil Deadline Assessment
    const assessment = await this.assessmentrepo.findOneAssessmentById(submission.assessment_id);
    if (!assessment?.expired_at) throw new ForbiddenException('Deadline ujian belum diatur.');

    // 3. LOGIKA WAKTU & KELENGKAPAN (Sekarang 100% Valid karena data dari Redis sudah di-flush ke DB)
    const now = new Date();
    const isTimeUp = now.getTime() > assessment.expired_at.getTime();

    if (!isTimeUp) {
        const totalAnswered = await this.answerRepo.totalAnswered(submissionId);
        const totalQuestion = await this.questionRepo.totalAnswered(submission.assessment_id); 
        
        if (totalAnswered < totalQuestion) {
            const sisa = totalQuestion - totalAnswered;
            throw new BadRequestException(`Waktu masih tersedia! Silakan lengkapi ${sisa} soal lagi.`);
        }
    }

    // 4. HITUNG SKOR (Aman karena database sudah up-to-date)
    const submissionWithAnswer = await this.submissionRepo.findOneIdSubmissionWithAnswer(submissionId);
    if (!submissionWithAnswer) throw new NotFoundException('Gagal memuat data jawaban.');

    let totalScore = 0;
    for (const ans of submissionWithAnswer.answer || []) { 
        if (ans.option) {
             totalScore += ans.option.score; 
        }
    }

    console.log(`[Finish] Submission ${submissionId} Finished. Score: ${totalScore}`);

    const socketPayload = {
        id: submissionId,
        status: 'FINISHED',
        score: totalScore,
        submitted_at: new Date(),
    };

    // 5. EMIT EVENT & UPDATE STATUS AKHIR
    this.submissionsGateway.notifySubmissionFinished(socketPayload);
    return await this.submissionRepo.updateStatusFinishSubmission(submissionId, totalScore);
  }

  async getUniqueSubmissionWithQuestions(submissionId: string) {
    return await this.submissionRepo.findOneSubmissionWithQuestion(submissionId);
  }
}
