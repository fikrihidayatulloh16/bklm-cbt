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
}