import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssessmentFromBankDto } from './dto/create/create-assessment-from-bank.dto';
import { QuestionBankRepository } from 'src/question-bank/repository/question-bank.repository.ts';
import { AssessmentMapper } from './mapper/assessment.mapper';
import { AssessmentRepository } from './repository/assessment.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class AssessmentService {
  constructor(
    private prisma: PrismaService,
    private questionBankRepo: QuestionBankRepository,
    private assessmentRepo: AssessmentRepository,
  ) {}

  // async create(dto: CreateAssessmentDto, user_id) {
  //   // Simpan data Assessment beserta relasi Question & Option secara bersamaan
  //   return await this.assessmentRepo.createOneAssessment(dto, user_id);
  // }

  async createFromBank(dto: CreateAssessmentFromBankDto, user_id) {
    const sourceBank = await this.questionBankRepo.findCompleteBank(dto.question_bank_id);

    if (!sourceBank) {
      throw new NotFoundException('Question Bank Not Found');
    }

    const questionForNewAssessment = AssessmentMapper.mapFromBankQuestions(sourceBank.questions)

    dto.duration = dto.duration * 60000

    return await this.assessmentRepo.createAssessmentFromBank(dto, questionForNewAssessment, user_id);
  }

  async publishAssessment(assessment_id: string) {
      const assessment = await this.assessmentRepo.findOneAssessmentForExam(assessment_id)
  
      //validasi keberadaaan ujian
      if (!assessment) throw new NotFoundException("Ujian tidak ditemukan");

      //validai durasi ujian
      if (!assessment.duration) throw new BadRequestException("Durasi ujian belum diatur");

      //validasi publikasi ujian
      if ( assessment.assessment_status === 'PUBLISHED' ) {throw new ForbiddenException('Assessment sudaah di publish, silahkan tunggu hingga selesai')}
  
      //Pembuatan created darui durasi
      const now = new Date();
      const globalDeadLine = new Date(now.getTime() + assessment.duration)
  
      return this.assessmentRepo.updateDeadlineAssessment(assessment_id, globalDeadLine, assessment.assessment_status = 'PUBLISHED')
    }

  async getAnalytics(assessmentId: string, className?: string) {
    // 1. Ambil Ranking Siswa (Code lama, tetap dipakai)
    const studentRanks = await this.assessmentRepo.getStudentRanks(assessmentId);

    // 2. AMBIL RAW DATA (Tetap sama)
    const rawAnswers = await this.assessmentRepo.findmanyAnswerByAssessmentIdClassName(assessmentId, className);

    // 3. AGGREGATE DATA 
    const { statsMap, grandTotalProblems } = AssessmentMapper.mapAnswerStats(rawAnswers);

    // 4. FINAL FORMATTING & SORTING
    // Ubah Map kembali menjadi Array
    const statArray = Array.from(statsMap.values())

    const finalReport = AssessmentMapper.mapFinalReport(statArray, grandTotalProblems)
    
    return {
        grand_total_problems: grandTotalProblems, // Info tambahan (826)
        question_analysis: finalReport,
        studentRanks
    };
  }

  async forceCloseTimeouts(assessmentId: string) {

    // Memastikan bahwa tidak boleh aksi jika asssessment berada dalam publish
    const assessment = await this.assessmentRepo.findAssessmentstatus(assessmentId)

    if (!assessment || assessment.assessment_status === "PUBLISHED") {
      throw new ForbiddenException("Assessment harus ada dan dilaarang PUBLISHED");
    }

    // 1. Ambil semua submission yang "nyangkut" (IN_PROGRESS)
    const stuckSubmissions = await this.prisma.submission.findMany({
      where: {
        assessment_id: assessmentId,
        status: 'IN_PROGRESS'
      },
      include: {
        answer: { include: { option: true } }, // Butuh opsi untuk hitung nilai
        assessment: true // Butuh expired_at
      }
    });

    const now = new Date();
    let closedCount = 0;

    // 2. Proses secara Parallel (biar cepat)
    const updatePromises = stuckSubmissions.map(async (sub) => {
      
      // Tentukan deadline (Prioritas: User deadline -> Global expired_at)
      const deadline = sub.assessment.expired_at;

      if (!deadline) {
        throw new BadRequestException(`expired_at yang dimasukkan:${deadline}`)       
      }

      // Cek apakah MEMANG sudah lewat waktu? (Buffer 1-2 menit jaga-jaga)
      if (now.getTime() > deadline.getTime()) {
        
        // A. Hitung Nilai (Logic yang sama dengan finish normal)
        let totalScore = 0;
        sub.answer.forEach(ans => {
          totalScore += ans.option?.score ?? 0; // Ambil nilai dari Option
        });

        // B. Update ke Database
        return this.prisma.submission.update({
          where: { id: sub.id },
          data: {
            status: 'FINISHED',
            score: totalScore,
            finish_method: 'FORCED', // <--- Tanda bahwa ini ditutup paksa Guru/Sistem
            submitted_at: now
          }
        });
      }
    });

    // Tunggu semua proses selesai
    const results = await Promise.all(updatePromises);
    
    // Filter yang tidak null (yang berhasil di-close)
    closedCount = results.filter(r => r !== undefined).length;

    return { 
      message: `Berhasil menutup paksa ${closedCount} siswa yang timeout.`,
      processed: closedCount 
    };
  }

  async findAssessmentResults(assessmentId: string, className?) {
    return await this.assessmentRepo.findAssessmentResults(assessmentId, className);
  }

  // mengambil semua assessment untuk dashboard
  async findAllAssessmentByIdUser(user_id) {
    return await this.assessmentRepo.countAllAssessmentQuestionsByUserId(user_id);
  }

  //mengambil assesment unik dan menghitung jumlah soal dan siswa submit
  async findOneAssessmentWithDetail(id: string) {
    const assessment = await this.assessmentRepo.findOneAssessmentWithDetail(id);

    if (!assessment) {
      // Opsional: Throw error di sini atau di controller jika tidak ketemu return null;
      throw new NotFoundException(`Assessment dengan ID ${id} tidak ditemukan`);
    }

    const now = new Date(); // membuat waktu saat ini

    if ( !assessment.expired_at ) { return 'deadline belum dibuat'  }

    // jika hari ini melebih waktu deadline ubah status jadi closed
    if ( now.getTime() >= assessment.expired_at.getTime() ) {
        this.assessmentRepo.updateDeadlineAssessment(assessment.id, assessment.expired_at, assessment.assessment_status = 'CLOSED')
    }

    return assessment;
  }

  async findOneAssessmentForExam(id: string) {
    const assessment = await this.assessmentRepo.findOneAssessmentForExam(id)

      if (!assessment) throw new NotFoundException(`Ujian tidak ditemukan`);

      return assessment;
  }

  //Mengambil Daftar kelas dari assessment
  async getDistinctStudentClass(assessmentId: string) {
    return await this.assessmentRepo.getDistinctStudentClass(assessmentId);
  }
}