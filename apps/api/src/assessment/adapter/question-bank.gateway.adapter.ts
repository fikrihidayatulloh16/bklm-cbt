// assessment/infrastructure/question-bank.gateway.adapter.ts
import { Injectable } from '@nestjs/common';
import { IQuestionBankGateway } from '../port/question-bank.gateway.port';
import { QuestionBankService } from '../../question-bank/question-bank.service'; // Panggil Service modul tetangga
import { QuestionBankResponse } from '../port/question-bank.gateway.port';

@Injectable()
export class QuestionBankGatewayAdapter implements IQuestionBankGateway {
  // Inject Service dari modul tetangga yang belum di-refactor
  constructor(private readonly qbService: QuestionBankService) {}

  async findOneQbId(qbId: string): Promise<QuestionBankResponse | null> {
    // 1. Memanggil kode gaya lama Anda (kembalian dari Prisma)
    const bank = await this.qbService.findOne(qbId); 
    
    // 2. Jika tidak ada, kembalikan NULL (Bukan array kosong [])
    if (!bank) {
      return null; 
    }
    
    // 3. Kembalikan dalam bentuk OBJEK yang memiliki properti id dan questions,
    // sesuai dengan antarmuka QuestionBankResponse
    return {
      id: bank.id,
      questions: bank.questions
    }; 
  }
}