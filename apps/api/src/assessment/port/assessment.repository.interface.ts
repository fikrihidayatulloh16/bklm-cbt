// ports/assessment.repository.interface.ts
import { Assessment } from "../entities/assessment.entity";

export const I_ASSESSMENT_REPOSITORY = 'IAssessmentRepository';

export interface IAssessmentRepository {
  // Prisma akan meng-generate UUID, lalu kita kembalikan Entity utuh
  // findOneAssessmentForExam(assessment: Assessment): Promise<Assessment | null>; 

    // findById(id: string): Promise<Assessment | null>;
  
    // Opsional jika Anda mau memisahkan fungsi create dari bank
    // createFromBank(assessment: Assessment, sourceQuestions: any[]): Promise<void>;
  findOneAssessmentForExam(id: string): Promise<Assessment | null>;
  updateStatus(id: string, status: string): Promise<Assessment | null>;
  findOneAssessmentByAssessmentId(assessmentId: string): Promise <Assessment | null>;
  getStudentRanks(assessmentId: string): Promise<any[]>;
  findmanyAnswerByAssessmentIdClassName(assessmentId: string, className?: string): Promise<any[]>;

  // Jika membuat, kembalikan Domain Entity yang sudah utuh (berisi ID baru, dll).
  createAssessmentFromBank(assessmentDomain: Assessment): Promise<Assessment>;

  // Stats biasanya mengembalikan Entity Assessment yang propertinya sudah diisi, atau DTO khusus.
  getAssessmentStats(userId: string): Promise<any>;

  // className sebaiknya opsional (?) agar konsisten. Mengembalikan Array hasil.
  findAssessmentResults(assessmentId: string, className?: string): Promise<any>;

  // Menghitung (count) PASTI mengembalikan angka murni. Bukan 'any'.
  countAllAssessmentQuestionsByUserId(userId: string): Promise<any>;

  // Pencarian by ID bisa saja TIDAK KETEMU. Wajib menggunakan `| null`. Kembalikan Entity!
  findAssessmentstatus(assessmentId: string): Promise<any>;

  // Sama seperti di atas, bisa jadi ujiannya sudah dihapus/tidak ada.
  findOneAssessmentWithDetail(assessmentId: string): Promise<any>;

  // Distinct class biasanya hanya butuh nama-nama kelas. Jadi ini adalah Array of Strings.
  getDistinctStudentClass(assessmentId: string): Promise<string[]>;
}
