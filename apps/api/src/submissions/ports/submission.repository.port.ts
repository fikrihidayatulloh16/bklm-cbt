import { SubmissionDomain } from "../submission.domain";

export const I_SUBMISSION_REPOSITORY = Symbol('I_SUBMISSION_REPOSITORY');

export interface ISubmissionRepository {
  // Mencari riwayat ujian siswa
  findDomainByStudent(assessmentId: string, studentName: string, className: string): Promise<SubmissionDomain | null>;
  
  // Menyimpan data baru atau memperbarui data lama
  createSubmission(assessmentId: string, studentName: string, className: string, gender: string): Promise<SubmissionDomain>;

  findOneSubmissionWithQuestion(submissionId: string) : Promise<SubmissionDomain>;

  findSubmissionNAssessmentDeadline(submissionId): Promise<SubmissionDomain> ;

  findSubmissionById(submissionId): Promise<SubmissionDomain>;

  findOneIdSubmissionWithAnswer(submissionId): Promise<SubmissionDomain>;

  updateStatusFinishSubmission(submissionId, totalScore): Promise<SubmissionDomain>;
}