import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssessmentDto } from './dto/create/create-assessment.dto';
import { CreateAssessmentFromBankDto } from './dto/create/create-assessment-from-bank.dto';
import { QuestionBankRepository } from 'src/question-bank/repository/question-bank.repository.ts';
import { AssessmentMapper } from './mapper/assessment.mapper';
import { AssessmentRepository } from './repository/assessment.repository';
import { error } from 'console';

@Injectable()
export class AssessmentService {
  constructor(
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

  async findAssessmentResults(assessmentId: string) {
    return await this.assessmentRepo.findAssessmentResults(assessmentId);
  }

  // mengambil semua assessment untuk dashboard
  async findAllAssessmentByIdUser(user_id) {
    return await this.assessmentRepo.findAllAssessment(user_id);
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