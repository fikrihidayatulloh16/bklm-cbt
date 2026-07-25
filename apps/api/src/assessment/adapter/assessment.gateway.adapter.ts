import { Injectable } from '@nestjs/common';
import { ISessionGateway, SessionValidationInfo } from '../port/assessment.gateway.port';
import { AssessmentSessionService } from '../../assessment-session/assessment-session.service'; // Panggil service aslinya

@Injectable()
export class SessionServiceAdapter implements ISessionGateway {
  constructor(private readonly sessionService: AssessmentSessionService) {}

  async getSession(assessmentId: string): Promise<SessionValidationInfo | null> {
    const sessionData = await this.sessionService.getSessionByAssessmentId(assessmentId);

    // Jika service melempar null (walaupun di service Anda sudah melempar NotFoundException)
    if (!sessionData) return null;

    // 🔥 TRANSLASI MURNI: Petakan secara eksplisit dari Domain ke DTO/Port
    return {
      // Sesuaikan 'end_time' dengan nama properti asli di AssessmentSessionDomain Anda
      endTime: sessionData.endTime, 
      
      // Gunakan nullish coalescing (??) agar jika undefined, otomatis jadi array kosong
      classIds: sessionData.classIds ?? [], 
    };
  }
}