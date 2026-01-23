import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuestionBankDto } from '../dto/create/create-question-bank.dto';
import { QuestionBankMapper } from '../mapper/question-bank.mapper';
import { CreateBulkYesNoDto } from '../dto/create/create-bulk-question.dto';

@Injectable()
export class QuestionBankRepository {
  constructor(private prisma: PrismaService) {}

  async createQuestionBank(dto: CreateQuestionBankDto, userId: string) {
  
      return await this.prisma.questionBank.create({
        data: {
          title: dto.title,
          description: dto.description,
          author_id: userId,
          questions: {
            create: QuestionBankMapper.toPrismaCreate(dto.questions),
          },
        },
      });
    }

  // Fungsi ini mengembalikan data Bank Soal LENGKAP dengan anak-anaknya
  async findCompleteBank(id: string) {
    return await this.prisma.questionBank.findUnique({
      where: { id },
      include: {
        questions: {
          include: { options: true }, // Include options agar terbawa
        },
      },
    });
  }
  
  async findUniqueQuestionBank(id: string) {
    return await this.prisma.questionBank.findUnique({
      where: { id },
      include: { 
        questions: { 
          orderBy: { order: 'desc' },
          include: { options: true }
        }
      }
    })
  }

  async findAllQuestionBankById(id:string) {
    return await this.prisma.questionBank.findMany({
      where: { author_id: id },
      orderBy: { created_at: 'desc' },
    })
  }
}