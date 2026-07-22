import { ForbiddenException } from '@nestjs/common';
import { SessionValidationInfo } from './ports/session.gateway.port';

export class SubmissionDomain {
  constructor(
    public readonly id: string,
    public readonly assessmentId: string,
    public readonly studentName: string,
    public readonly className: string,
    public status: 'IN_PROGRESS' | 'FINISHED',
    public readonly sessionId?: string, 
  ) {}

  // 💡 Menerima tipe data internal yang terisolasi
  public validateEligibilityToStart(session: SessionValidationInfo): void {
    if (this.status === 'FINISHED') {
      throw new ForbiddenException('Anda sudah menyelesaikan ujian ini.');
    }

    const now = new Date().getTime();
    if (session.endTime.getTime() < now) {
      throw new ForbiddenException('Waktu sesi ujian sudah habis! Anda terlambat.');
    }

    // ✅ Memperbaiki Error: 'session.classIds' is possibly 'undefined'
    // Menggunakan fallback array kosong jika undefined
    const allowedClasses = session.classIds || [];
    if (!allowedClasses.includes(this.className)) { 
       throw new ForbiddenException('Sesi ujian ini tidak dibuka untuk kelas Anda.');
    }
  }

  static createNew(dto: any, assessmentId: string, sessionId: string): SubmissionDomain {
    return new SubmissionDomain(
      'akan-di-generate-db',
      assessmentId,
      dto.student_name,
      dto.class_name,
      'IN_PROGRESS',
      sessionId
    );
  }
}