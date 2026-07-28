// ports/assessment.repository.interface.ts
import { Assessment } from "../entities/assessment.entity";

export const I_ASSESSMENT_REPOSITORY = 'IAssessmentRepository';

export interface IAssessmentRepository {
  // Prisma akan meng-generate UUID, lalu kita kembalikan Entity utuh
  createAssessmentFromBank(assessment: Assessment): Promise<Assessment>; 

    // findById(id: string): Promise<Assessment | null>;
  
    // Opsional jika Anda mau memisahkan fungsi create dari bank
    // createFromBank(assessment: Assessment, sourceQuestions: any[]): Promise<void>;
}