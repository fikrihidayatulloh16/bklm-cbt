import { SubmissionDomain } from "../entities/submission.entity";

export const I_SUBMISSION_REPOSITORY = Symbol('I_SUBMISSION_REPOSITORY');

export interface ISubmissionRepository {
  // Mencari riwayat ujian siswa
  findDomainByStudent(assessmentId: string, studentName: string, className: string): Promise<SubmissionDomain | null>;

  // Menyimpan data baru atau memperbarui data lama
  createSubmission(assessmentId: string, studentName: string, classId: string, className: string, gender: string, sessionId: string,): Promise<SubmissionDomain>;
  
  // Menyimpan data baru atau memperbarui data lama
  // save(domain: SubmissionDomain): Promise<SubmissionDomain>;

  findOneSubmissionWithQuestion(submissionId: string) : Promise<SubmissionDomain>;

  findSubmissionNAssessmentDeadline(submissionId): Promise<SubmissionDomain> ;

  findSubmissionById(submissionId): Promise<SubmissionDomain>;

  findOneIdSubmissionWithAnswer(submissionId): Promise<SubmissionDomain>;

  updateStatusFinishSubmission(submissionId, totalScore): Promise<SubmissionDomain>;

  // Ambil submission yang nyangkut beserta relasi jawabannya dan sesinya
  findStuckSubmissions(assessmentId: string): Promise<any[]>; 

  // Update status submission menjadi FINISHED beserta skornya
  forceFinishSubmission(submissionId: string, score: number): Promise<void>;
}