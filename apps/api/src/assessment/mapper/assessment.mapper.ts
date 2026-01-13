// Kita butuh tipe data asli dari Prisma untuk Type Safety
import { BankQuestion, BankQuestionOption } from '@prisma/client';

// Helper Type: Mendefinisikan struktur data yang diambil dari DB
// (BankQuestion yang punya anak options)
type BankQuestionWithRelations = BankQuestion & { 
  options: BankQuestionOption[] 
};

export class AssessmentMapper {
  // Static Method: Hemat memori
  static mapFromBankQuestions(bankQuestions: BankQuestionWithRelations[]) {
    return bankQuestions.map((bq) => ({
      // Kita copy value-nya
      text: bq.text,
      type: bq.type, 
      category: bq.category,
      order: bq.order,
      
      // Kita susun struktur 'Nested Write' untuk Assessment
      options: {
        create: bq.options.map((opt) => ({
          label: opt.label,
          score: opt.score,
        }))
      }
    }));
  }
}