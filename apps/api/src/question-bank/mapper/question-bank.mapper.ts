// src/question-bank/mapper/question-bank.mapper.ts
import { CreateBankQuestionDto } from '../dto/create/create-bankquestion.dto';

export class QuestionBankMapper {
  static toPrismaCreate(dto: CreateBankQuestionDto[]) {
    return dto.map((q) => ({
      text: q.text,
      type: q.type,
      category: q.category,
      options: {
        create: q.options.map((opt) => ({
          label: opt.label,
          score: opt.score,
        })),
      },
    }));
  }
}



