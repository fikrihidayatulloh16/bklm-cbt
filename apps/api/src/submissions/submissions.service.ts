import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { StartSubmissionDTO } from './dto/start-submission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaveAnswerDTO } from './dto/save-answers,dto';
import { SubmissionRepository } from './repository/submissions.repository';
import { AssessmentRepository } from 'src/assessment/repository/assessment.repository';
import { AnswerRepository } from './repository/answer.repository';
import { QuestionRepository } from './repository/question.repository';
import { error } from 'console';

@Injectable()
export class SubmissionsService {
  constructor(
    private prisma: PrismaService,
    private submissionRepo: SubmissionRepository,
    private assessmentrepo: AssessmentRepository,
    private answerRepo: AnswerRepository,
    private questionRepo: QuestionRepository
  ) {}

  // Pastikan DTO Anda menerima 'class_name' (String), bukan 'class_id'
  async startSubmission(dto: StartSubmissionDTO, assessment_id: string,submission_id?: string) {

    const assessment = await this.assessmentrepo.findOneAssessmentById(assessment_id)

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
      throw new ForbiddenException('Assessment ini Tidak Dibuka, silahkan hubungi Guru yang bersangkutan')
    }

    const deadLine = assessment.expired_at.getTime()
    const now = new Date().getTime()
    
    if (deadLine < now) {
       throw new ForbiddenException('Waktu ujian sudah habis! Anda terlambat.');
    }

    const newSubmission = await this.submissionRepo.createSubmission(dto, assessment_id);

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

  // submissions.service.ts

  async saveAnswer(submissionId: string, dto: SaveAnswerDTO) {
    // [OPTIMASI QUERY 1 & 3] 
    // Ambil Submission SEKALIGUS Deadline Assessment-nya
    // Pastikan repo Anda support include/select assessment
    const submission = await this.submissionRepo.findSubmissionNAssessmentDeadline(submissionId); 
    
    // Validasi dasar
    if (!submission) throw new NotFoundException("Submission tidak ditemukan");
    if (submission.status === 'FINISHED') throw new ForbiddenException("Ujian sudah ditutup.");

    // [QUERY 2] Validasi Soal (Wrong Room Prevention) - Ini Oke dipertahankan demi keamanan
    const question = await this.questionRepo.findUniqueQuestion(dto.question_id);
    if (!question) throw new NotFoundException("Pertanyaan tidak valid");
    if (question.assessment_id !== submission.assessment_id) {
        throw new BadRequestException("Pertanyaan ini bukan bagian dari ujian ini!");
    }

    // [VALIDASI WAKTU]
    const now = new Date();
    // Kita ambil expired_at dari relasi submission -> assessment (hasil optimasi query 1)
    // Pastikan repository Anda melakukan JOIN/INCLUDE ke tabel assessment
    const expiredAt = submission.assessment?.expired_at; 

    if (!expiredAt) {
         // Safety check jika data assessment korup/tidak terload
         console.error(`Assessment ID ${submission.assessment_id} tidak punya expired_at`);
         throw new BadRequestException('Konfigurasi waktu ujian invalid');
    }

    // Grace Period: Toleransi 2 menit untuk latensi internet siswa
    const GRACE_PERIOD_MS = 2 * 60 * 1000;

    if (now.getTime() > (expiredAt.getTime() + GRACE_PERIOD_MS)) {
         // 🛑 STOP DISINI!
         // Jangan panggil this.finish() disini. Itu tugas Frontend atau Lazy Close.
         // Tugas kita disini hanya MENOLAK jawaban baru.
         this.finish(submissionId)
         throw new ForbiddenException("Waktu ujian telah habis! Jawaban tidak tersimpan.");
    }

    // [QUERY 3 - FINAL] Simpan Jawaban
    try {
        return await this.answerRepo.upsertAnswer(
            submissionId,
            dto
        );
    } catch (error) {
        // Error handling Foreign Key
        if (error.code === 'P2003' || error.message?.includes('Foreign key constraint')) {
             throw new BadRequestException("Pilihan jawaban tidak valid.");
        }
        throw error;
    }
}

  async finish(submissionId: string) {
    // 1. Ambil Data Submission
    const submission = await this.submissionRepo.findSubmissionById(submissionId);
    if (!submission) throw new ForbiddenException('Submission tidak ditemukan');
    if (submission.status === 'FINISHED') throw new BadRequestException(`Submission sudah selesai.`);

    // 2. Ambil Deadline Assessment
    // Pastikan repository ini juga mengambil 'expired_at'
    const assessment = await this.assessmentrepo.findOneAssessmentById(submission.assessment_id);
    if (!assessment?.expired_at) throw new ForbiddenException('Deadline ujian belum diatur.');

    // 3. LOGIKA WAKTU & KELENGKAPAN
    const now = new Date();
    // Gunakan ">" (Lewat waktu), JANGAN "==" (Sama persis)
    const isTimeUp = now.getTime() > assessment.expired_at.getTime();

    // HANYA jika waktu BELUM habis, kita cek apakah semua soal sudah dijawab
    if (!isTimeUp) {
        const totalAnswered = await this.answerRepo.totalAnswered(submissionId);
        const totalQuestion = await this.questionRepo.totalAnswered(submission.assessment_id); // Asumsi ini fungsi hitung total soal
        
        if (totalAnswered < totalQuestion) {
            const sisa = totalQuestion - totalAnswered;
            throw new BadRequestException(`Waktu masih tersedia! Silakan lengkapi ${sisa} soal lagi.`);
        }
    }

    // 4. HITUNG SKOR (Logic Utama)
    // Kita ambil Full Data (Jawaban + Opsi + Score-nya)
    const submissionWithAnswer = await this.submissionRepo.findOneIdSubmissionWithAnswer(submissionId);
    
    if (!submissionWithAnswer) throw new NotFoundException('Gagal memuat data jawaban.');

    let totalScore = 0;
    
    // Loop jawaban yang ada
    for (const ans of submissionWithAnswer.answer || []) { // Pastikan pakai 'answers' (plural/singular sesuaikan backend)
        // Karena kita sudah tidak simpan score di tabel Answer,
        // Kita WAJIB ambil score dari relasi Option
        if (ans.option) {
             totalScore += ans.option.score; 
        }
    }

    console.log(`[Finish] Submission ${submissionId} Finished. Score: ${totalScore}`);

    // 5. UPDATE STATUS & SCORE
    return await this.submissionRepo.updateStatusFinishSubmission(submissionId, totalScore);
  }

  async getUniqueSubmissionWithQuestions(submissionId: string) {
    return await this.submissionRepo.findOneSubmissionWithQuestion(submissionId);
  }
}
