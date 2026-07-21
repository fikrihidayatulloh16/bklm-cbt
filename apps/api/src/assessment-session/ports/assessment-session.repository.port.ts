import { CreateAssessmentSessionDto } from '../dto/create-assessment-session.dto';
import { AssessmentSessionDomain } from '../entities/assessment-session.domain';

export abstract class IAssessmentSessionRepository {
  abstract create(dto: CreateAssessmentSessionDto): Promise<AssessmentSessionDomain>;
  
  // Endpoint Read-Heavy (Nanti bisa di-cache pakai Redis)
  abstract findActiveSessionsByClass(classId: string): Promise<AssessmentSessionDomain[]>;
}