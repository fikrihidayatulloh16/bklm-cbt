import { SubmissionDomain } from '../entities/submission.entity';

export class SubmissionMapper {
  static toDomain(rawRecord: any): SubmissionDomain {
    return new SubmissionDomain(
      rawRecord.id,
      rawRecord.assessment_id, // Pastikan ini sesuai dengan nama kolom Prisma Anda
      rawRecord.student_name,
      rawRecord.class_id,
      rawRecord.class_name,
      rawRecord.status,
      rawRecord.session_id,
      rawRecord.answer
    );
  }
}