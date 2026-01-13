import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssessmentDto } from './dto/create/create-assessment.dto';
//import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuestionBankDto } from 'src/question-bank/dto/create/create-question-bank.dto';
import { CreateAssessmentFromBankDto } from './dto/create/create-assessment-from-bank.dto';
import { QuestionBankRepository } from 'src/question-bank/repository/question-bank.repository.ts';
import { AssessmentMapper } from './mapper/assessment.mapper';

@Injectable()
export class AssessmentService {
  constructor(
    private prisma: PrismaService,
    private questionBankRepo: QuestionBankRepository
  ) {}

  async create(dto: CreateAssessmentDto) {
    // Simpan data Assessment beserta relasi Question & Option secara bersamaan
    return await this.prisma.assessment.create({
      data: {
        title: dto.title,
        description: dto.description,
        expired_at: dto.expired_at,
        school_id: dto.school_id,
        user_id: dto.user_id,
      },
    });
  }

  async createFromBank(dto: CreateAssessmentFromBankDto) {
    const sourceBank = await this.questionBankRepo.findCompleteBank(dto.question_bank_id);

    if (!sourceBank) {
      throw new NotFoundException('Questiom Bank Not Found');
    }

    const questionForNewAssessment = AssessmentMapper.mapFromBankQuestions(sourceBank.questions)

    return await this.prisma.assessment.create({
      data: {
        title: dto.title,
        description: dto.description,
        school_id: dto.school_id,
        user_id: dto.user_id,
        questions: {
          create: questionForNewAssessment
        }
      },
      include: {
          questions: {include: { options: true }}
        }
    });
  }

  async findAssessmentResults(assessmentId: string) {
    return await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        // Ambil daftar submission (lembar jawab siswa)
        submissions: {
          select: {
            id: true,
            student_name: true, // Ambil nama snapshot
            class_name: true,   // Ambil kelas snapshot
            score: true,        // Ambil nilai
            status: true,       // FINISHED / IN_PROGRESS
            submitted_at: true, // Kapan selesai
            // answers: false   // Gak perlu ambil jawaban detail dulu biar ringan
          },
          orderBy: {
              score: 'desc' // Urutkan dari nilai tertinggi (Ranking)
          }
        }
      }
    });
  }

  async findAll() {
    return await this.prisma.assessment.findMany({
      orderBy: {
        created_at: 'desc'
      }
    })
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
