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
      
      // 1. Ambil Data Submission (Untuk tahu dia sedang mengerjakan ujian apa)
      const submission = await this.submissionRepo.findSubmissionById(submissionId);
      if (!submission) throw new NotFoundException("Submission tidak ditemukan");

      //Validasi status submission
      if (submission.status === 'FINISHED') {
          throw new ForbiddenException("Ujian sudah ditutup.");
      }

      // 2. VALIDASI PERTANYAAN (Wrong Room Attack Prevention)
      // Ambil detail pertanyaan berdasarkan ID yang dikirim siswa
      const question = await this.questionRepo.findUniqueQuestion(dto.question_id);

      if (!question) throw new NotFoundException("Pertanyaan tidak valid");

      // Cek: Apakah pertanyaan ini BENAR milik Assessment yang sedang dikerjakan?
      // Jangan sampai siswa mengerjakan soal Fisika di ujian Biologi.
      if (question.assessment_id !== submission.assessment_id) {
          throw new BadRequestException("Pertanyaan ini bukan bagian dari ujian ini!");
      }

      // 3. VALIDASI OPSI (Hanya untuk Pilihan Ganda)
      // Jika bukan essay (misal TYPE 'MULTIPLE_CHOICE'), pastikan option_id valid
      if (question.type !== 'ESSAY' && dto.option_id) {
          const isValidOption = await this.questionRepo.findquestionOptionById(dto.option_id, dto.question_id);
          
          if (!isValidOption) {
              throw new BadRequestException("Pilihan jawaban tidak ditemukan/dimanipulasi.");
          }
      }

      // 4. SIMPAN JAWABAN (Upsert: Update jika ada, Create jika belum)
      // Cek dulu di DB apakah sudah pernah jawab nomor ini?
      const existingAnswer = await this.answerRepo.findAnswerBySubmissionIdNQuestionId(submissionId, dto.question_id);

      if (existingAnswer) {
          // Update jawaban lama
          return await this.answerRepo.updateAnswer(
              existingAnswer.id, 
              dto.option_id, 
              dto.text_value // Kosongkan jika pilgan, isi jika essay
          );
      } else {
          // Buat jawaban baru
          return await this.answerRepo.createAnswer(
              submissionId, 
              dto.question_id, 
              dto.option_id, 
              dto.text_value
          );
      }
  }

    async finish(submissionId: string) {

      //Mencari dulu apakah responded sudah submission
      const submission = await this.submissionRepo.findSubmissionById(submissionId)
      if (!submission) {
        throw new ForbiddenException('submission tidak ditemukan')
      }

      if (submission.status === 'FINISHED') {
        throw new BadRequestException(`Submission sudah selesai dilakukan`)
      }

      const totalAnswered = await this.answerRepo.totalAnswered(submissionId)

      const totalQuestion = await this.questionRepo.totalAnswered(submission?.assessment_id)

      // mendapatkan deadline
      const deadLine = await this.assessmentrepo.findOneAssessmentById(submission.assessment_id)
        if (!deadLine?.expired_at) { throw new ForbiddenException('Deadline belum dibuat') }

      const now = new Date()


      if (now.getTime() == deadLine.expired_at.getTime()) {
        const submissionWithAnswer = await this.submissionRepo.findOneIdSubmissionWithAnswer(submissionId)

      let totalScore = 0

      if (!submissionWithAnswer) {
        throw new NotFoundException('Data submission tidak ditemukan saat mau menghitung nilai.');
      }

      for (const a of submissionWithAnswer?.answer) {
        const score = a.option?.score ?? 0
        
        totalScore += score
      }

      return await this.submissionRepo.updateStatusFinishSubmission(submissionId, totalScore)
      }
      //siswaa tidak bisa mengumpulkan selama jawaban belum lengkap dan waktu masih ada
      else if (totalAnswered < totalQuestion && now.getTime() < deadLine.expired_at.getTime()) {
        const sisa = totalQuestion - totalAnswered;
        throw new BadRequestException(`Belum selesai dan waktu masih ada! masih ada '${sisa}' soal lagi yang belum terjawab `)
      }
      
      

      const submissionWithAnswer = await this.submissionRepo.findOneIdSubmissionWithAnswer(submissionId)

      let totalScore = 0

      if (!submissionWithAnswer) {
        throw new NotFoundException('Data submission tidak ditemukan saat mau menghitung nilai.');
      }

      for (const a of submissionWithAnswer?.answer) {
        const score = a.option?.score ?? 0
        
        totalScore += score
      }

      return await this.submissionRepo.updateStatusFinishSubmission(submissionId, totalScore)
    }

  // findAll() {
  //   return `This action returns all submissions`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} submission`;
  // }

  // update(id: number, updateSubmissionDto: UpdateSubmissionDto) {
  //   return `This action updates a #${id} submission`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} submission`;
  // }
}
