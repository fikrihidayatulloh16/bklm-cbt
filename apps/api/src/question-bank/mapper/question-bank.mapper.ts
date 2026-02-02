// src/question-bank/mapper/question-bank.mapper.ts
import { CreateBankQuestionDto } from '../dto/create/create-bankquestion.dto';
import { UpdateQuestionBankDto } from '../dto/update/update-question-bank.dto';
import { UpdateQuestionBankParams } from '../helper/interfaces/question-bank.interface';

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

  static toUpdateParams(dto: UpdateQuestionBankDto): UpdateQuestionBankParams {
  return {
    title: dto.title,
    description: dto.description,
    shared: dto.shared,
    // Map questions jika ada
    questions: dto.questions?.map((q) => ({
      id: q.id, // Penting! Bawa ID-nya
      text: q.text,
      type: q.type,
      options: q.options?.map((opt) => ({
        id: opt.id, // Penting! Bawa ID opsi
        label: opt.label,
        score: opt.score,
        order: opt.order,
      })) || [],
    })),
  };
}
}



