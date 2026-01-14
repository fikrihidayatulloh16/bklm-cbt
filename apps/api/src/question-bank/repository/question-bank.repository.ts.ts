import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QuestionBankRepository {
  constructor(private prisma: PrismaService) {}

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