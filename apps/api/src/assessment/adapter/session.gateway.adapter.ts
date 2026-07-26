// apps/api/src/assessment/adapter/session.gateway.adapter.ts
import { Injectable } from '@nestjs/common';
import { ISessionGateway, SessionValidationInfo, CreataeSessionPayload } from '../port/session.gateway.port';
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

  async createSession(payload: CreataeSessionPayload): Promise<void> {
    const now = new Date();

    await this.sessionService.createSession({
      name: 'Sesi Utama Ujian', // Nama default
      start_time: now.toISOString(),
      end_time: payload.endTime.toISOString(),
      assessment_id: payload.assessmentId,
      class_ids: payload.classIds // 🔥 Alirkan ID kelas ke service sesi
    });
  }
}