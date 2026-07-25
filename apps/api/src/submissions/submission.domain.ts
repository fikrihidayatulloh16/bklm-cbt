// hapus: import { ForbiddenException } from '@nestjs/common';
import { SessionValidationInfo } from './ports/session.gateway.port';

// 💡 Buat Custom Error murni JavaScript di dalam file domain
export class SubmissionDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubmissionDomainError';
  }
}

// Custom Error KHUSUS untuk waktu habis
export class SubmissionTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubmissionTimeoutError';
  }
}

export class SubmissionDomain {
  constructor(
    public readonly id: string,
    public readonly assessmentId: string,
    public readonly studentName: string,
    public readonly className: string,
    public status: 'IN_PROGRESS' | 'FINISHED',
    public readonly sessionId?: string, 
    public readonly answers?: any[]
  ) {}

  public validateEligibilityToStart(session: SessionValidationInfo): void {
    if (this.status === 'FINISHED') {
      // 💡 Lempar error murni
      throw new SubmissionDomainError('Anda sudah menyelesaikan ujian ini.');
    }

    const now = new Date().getTime();
    if (session.endTime.getTime() < now) {
      throw new SubmissionDomainError('Waktu sesi ujian sudah habis! Anda terlambat.');
    }

    const allowedClasses = session.classIds || [];
    if (!allowedClasses.includes(this.className)) { 
       throw new SubmissionDomainError('Sesi ujian ini tidak dibuka untuk kelas Anda.');
    }
  }

  // Hindari penggunaan 'any' untuk parameter DTO jika memungkinkan
  static createNew(dto: { student_name: string; class_name: string }, assessmentId: string, sessionId: string): SubmissionDomain {
    return new SubmissionDomain(
      'akan-di-generate-db',
      assessmentId,
      dto.student_name,
      dto.class_name,
      'IN_PROGRESS',
      sessionId
    );
  }

  public validateCanAnswer(
    questionAssessmentId: string, 
    sessionEndTime: Date | undefined | null,
    currentTime: Date = new Date() // Dependency injection waktu untuk mempermudah Test
  ): void {
    
    // Aturan 1: Status Ujian
    if (this.status === 'FINISHED') {
      throw new SubmissionDomainError("Ujian sudah ditutup.");
    }

    // Aturan 2: Wrong Room Prevention
    if (this.assessmentId !== questionAssessmentId) {
      throw new SubmissionDomainError("Pertanyaan ini bukan bagian dari ujian ini!");
    }

    // Aturan 3: Validasi Waktu & Grace Period
    if (!sessionEndTime) {
      throw new SubmissionDomainError('Konfigurasi waktu ujian invalid');
    }

    const GRACE_PERIOD_MS = 2 * 60 * 1000; // 2 menit
    if (currentTime.getTime() > (sessionEndTime.getTime() + GRACE_PERIOD_MS)) {
       // Lempar error khusus agar Service tahu harus melakukan auto-finish
       throw new SubmissionTimeoutError("Waktu ujian telah habis! Jawaban tidak tersimpan.");
    }
  }

  public validateCanFinish(
    sessionEndTime: Date | undefined | null,
    totalAnswered: number,
    totalQuestions: number,
    currentTime: Date = new Date()
  ): void {
    if (this.status === 'FINISHED') {
      throw new SubmissionDomainError("Submission sudah selesai.");
    }

    if (!sessionEndTime) {
      throw new SubmissionDomainError("Konfigurasi sesi ujian tidak valid atau tidak ditemukan.");
    }

    const isTimeUp = currentTime.getTime() > sessionEndTime.getTime();

    // Aturan Bisnis: Jika waktu belum habis, siswa TIDAK BOLEH selesai sebelum semua soal dijawab
    if (!isTimeUp && totalAnswered < totalQuestions) {
      const sisa = totalQuestions - totalAnswered;
      throw new SubmissionDomainError(`Waktu masih tersedia! Silakan lengkapi ${sisa} soal lagi.`);
    }
  }

  public calculateTotalScore(): number {
    if (!this.answers || this.answers.length === 0) return 0;
    
    return this.answers.reduce((total, ans) => {
      return total + (ans.option?.score || 0);
    }, 0);
  }
}