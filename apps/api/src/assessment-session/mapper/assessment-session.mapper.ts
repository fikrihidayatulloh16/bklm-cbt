import { AssessmentSession, Class } from '@prisma/client';
import { AssessmentSessionDomain } from '../entities/assessment-session.domain';

// Tipe data gabungan karena kita melakukan 'include: { classes: true }' di Prisma
type PrismaAssessmentSessionWithClasses = AssessmentSession & { classes?: Class[] };

export class AssessmentSessionMapper {
  static toDomain(prismaEntity: PrismaAssessmentSessionWithClasses): AssessmentSessionDomain {
    return new AssessmentSessionDomain(
      prismaEntity.id,
      prismaEntity.name,
      prismaEntity.start_time,
      prismaEntity.end_time,
      prismaEntity.assessment_id,
      // Ekstrak hanya ID kelasnya saja untuk kebutuhan Domain
      prismaEntity.classes?.map((c) => c.id) || [],
    );
  }
}