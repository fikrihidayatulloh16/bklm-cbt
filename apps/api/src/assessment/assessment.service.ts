import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssessmentDto } from './dto/create/create-assessment.dto';
import { CreateAssessmentFromBankDto } from './dto/create/create-assessment-from-bank.dto';
import { QuestionBankRepository } from 'src/question-bank/repository/question-bank.repository.ts';
import { AssessmentMapper } from './mapper/assessment.mapper';
import { AssessmentRepository } from './repository/assessment.repository';

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
  
      if (!assessment) throw new NotFoundException("Ujian tidak ditemukan");
      if (!assessment.duration) throw new BadRequestException("Durasi ujian belum diatur");
  
      const now = new Date();
      const globalDeadLine = new Date(now.getTime() + assessment.duration)
  
      return this.assessmentRepo.updateDeadlineAssessment(assessment_id, globalDeadLine)
    }

  async findAssessmentResults(assessmentId: string) {
    return await this.assessmentRepo.findAssessmentResults(assessmentId);
  }

  // mengambil semua assessment untuk dashboard
  async findAll() {
    return await this.assessmentRepo.findAllAssessment();
  }

  //mengambil assesment unik dan menghitung jumlah soal dan siswa submit
  async findOneAssessmentWithDetail(id: string) {
    const assessment = await this.assessmentRepo.findOneAssessmentWithDetail(id);

    if (!assessment) {
      // Opsional: Throw error di sini atau di controller jika tidak ketemu return null;
      throw new NotFoundException(`Assessment dengan ID ${id} tidak ditemukan`);
    }

    return assessment;
  }

  async findOneAssessmentForExam(id: string) {
    const assessment = await this.assessmentRepo.findOneAssessmentForExam(id)

      if (!assessment) throw new NotFoundException(`Ujian tidak ditemukan`);

      return assessment;
  }

  // findAll() {
  //   return `This action returns all assessment`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} assessment`;
  // }

  // update(id: number, updateAssessmentDto: UpdateAssessmentDto) {
  //   return `This action updates a #${id} assessment`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} assessment`;
  // }
}
