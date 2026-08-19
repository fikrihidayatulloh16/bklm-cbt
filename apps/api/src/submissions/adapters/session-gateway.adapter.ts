// apps/api/src/submissions/adapters/session-gateway.adapter.ts
import { Injectable } from '@nestjs/common';
import { ISessionGateway, SessionValidationInfo } from '../ports/session.gateway.port';
import { AssessmentSessionService } from '../../assessment-session/assessment-session.service';

@Injectable()
export class SessionServiceAdapter implements ISessionGateway {
  constructor(private readonly sessionService: AssessmentSessionService) {}

  async getSession(sessionId: string): Promise<SessionValidationInfo | null> {
    const sessionData = await this.sessionService.getSessionById(sessionId);

    // 1. Karena kembaliannya Array, kita cek apakah array-nya kosong
    if (!sessionData) return null;

    // 2. Ambil sesi pertama yang ditemukan dari dalam Array
    // const session = sessionData[0];
    

    return {
      // 3. Panggil properti TEPAT sesuai yang tertera di Domain Anda (_endTime & _classIds)
      endTime: new Date(sessionData._endTime),
      classIds: sessionData._classIds ?? [], 
    };
  }
}