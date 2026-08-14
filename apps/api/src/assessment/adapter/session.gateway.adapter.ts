// apps/api/src/assessment/adapter/session.gateway.adapter.ts
import { Injectable } from '@nestjs/common';
import { ISessionGateway, SessionValidationInfo, CreataeSessionPayload } from '../port/session.gateway.port';
import { AssessmentSessionService } from '../../assessment-session/assessment-session.service'; // Panggil service aslinya

@Injectable()
export class SessionServiceAdapter implements ISessionGateway {
  constructor(private readonly sessionService: AssessmentSessionService) {}

  async getSession(assessmentId: string): Promise<SessionValidationInfo | null> {
    const sessionData = await this.sessionService.getActiveSessionsByAssessmentId(assessmentId);

    // 1. Jika tidak ada sesi yang berjalan sama sekali
    if (!sessionData || sessionData.length === 0) {
      return null;
    }

    // 2. Ambil elemen pertama. 
    // Aman karena aturan bisnis: HANYA ADA 1 SESI BERJALAN.
    const activeSession = sessionData[0];

    // 3. Petakan secara eksplisit dari Domain ke Port
    return {
      endTime: activeSession._endTime, 
      // Satu sesi mencakup banyak kelas, jika kosong jadikan array kosong
      classIds: activeSession._classIds ?? [], 
    };
  }

  async createSessionForPublish(
    assessmentId: string,
    sessionName: string,
    durationMs: number,
    classIds: string[]
  ): Promise<void> {
    // 🔥 Delegasikan tugas ini ke pemilik aslinya!
    await this.sessionService.createSessionForPublish(
      assessmentId, sessionName, durationMs, classIds
    );
  }
}