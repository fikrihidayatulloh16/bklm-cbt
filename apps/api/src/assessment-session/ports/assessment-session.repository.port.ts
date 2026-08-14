import { CreateAssessmentSessionDto } from '../dto/create-assessment-session.dto';
import { AssessmentSessionDomain } from '../entities/assessment-session.domain';

export abstract class IAssessmentSessionRepository {
  abstract create(dto: AssessmentSessionDomain): Promise<AssessmentSessionDomain>;
  
  // Endpoint Read-Heavy (Nanti bisa di-cache pakai Redis)
  abstract findActiveSessionsByAssessmentId(assessmentId: string): Promise<AssessmentSessionDomain[]>;

  abstract findSessionBySessionId(sessionId: string): Promise<AssessmentSessionDomain | null>;

  abstract findActiveSessionsByClassId(classId: string): Promise<AssessmentSessionDomain[]>;
}