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

  async getAnalytics(assessmentId: string) {
    // menghitung score siswa dari yang tertinggi
    const studentRanks = await this.assessmentRepo.getStudentRanks(assessmentId);

    // A. HITUNG STATISTIK (Query GroupBy)
    // Query ini murni matematika, sangat cepat
    const stats = await this.prisma.answer.groupBy({
        by: ['question_id'],
        where: {
            submission: { assessment_id: assessmentId, } // Filter per Ujian
        },
        _sum: {
            numeric_value: true // Ini sekarang sudah AMAN karena sudah kita isi di Langkah 1
        },
        _count: {
            numeric_value: true // Jumlah penjawab
        },
        orderBy: {
            _sum: { numeric_value: 'desc' } // Urutkan dari masalah terbesar
        }
    });

    // B. AMBIL TEKS SOAL (Query Tambahan)
    // Karena groupBy cuma menghasilkan ID, kita perlu ambil detail soalnya
    
    // 1. Kumpulkan semua question_id dari hasil stats
    const questionIds = stats.map(s => s.question_id);

    // 2. Ambil detail soal dari database
    const questions = await this.prisma.question.findMany({
        where: { id: { in: questionIds } },
        select: { id: true, text: true, category: true }
    });

    // C. GABUNGKAN DATA (Merge)
    const finalReport = stats.map(stat => {
        // Cari teks soal yang cocok dengan ID
        const qDetail = questions.find(q => q.id === stat.question_id);

        return {
            question_id: stat.question_id,
            question_text: qDetail?.text || "Soal dihapus",
            category: qDetail?.category,
            total_risk_score: stat._sum.numeric_value || 0,
            respondents: stat._count.numeric_value || 0,
            average: (stat._sum.numeric_value || 0) / (stat._count.numeric_value || 1)
        };
    });

    return {
        question_analysis: finalReport,
        studentRanks
    };
}

  async generateExcel(assessmentId: string): Promise<Buffer> {
    // 1. AMBIL DATA (Reuse fungsi analytics yang sudah ada biar hemat koding)
    const data = await this.getAnalytics(assessmentId);

    // 2. SIAPKAN WORKBOOK (Buku Kerja Excel)
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Analisis Soal');

    // 3. BIKIN HEADER KOLOM
    // key: harus sama dengan field data nanti
    // width: lebar kolom di excel
    worksheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Pertanyaan', key: 'question', width: 50 },
        { header: 'Kategori', key: 'category', width: 20 },
        { header: 'Total Poin', key: 'score', width: 15 },
        { header: 'Responden', key: 'count', width: 15 },
    ];

    // 4. ISI BARIS (Looping data)
    data.question_analysis.forEach((q, index) => {
        worksheet.addRow({
            no: index + 1,
            question: q.question_text,
            category: q.category || '-',
            score: q.total_risk_score,
            count: q.respondents,
        });
    });

    // 5. STYLING SEDERHANA (Opsional: Bold Header)
    worksheet.getRow(1).font = { bold: true };

    // 6. RETURN SEBAGAI BUFFER (Data Mentah)
    // Kita convert workbook jadi Buffer (urutan byte) agar bisa dikirim lewat HTTP
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Casting ke Buffer bawaan Node.js agar Controller tidak bingung
    return buffer as unknown as Buffer;
  }

  async findAssessmentResults(assessmentId: string) {
    return await this.assessmentRepo.findAssessmentResults(assessmentId);
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
}