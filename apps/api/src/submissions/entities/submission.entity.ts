import { StartSubmissionDTO } from '../dto/start-submission.dto';
import { SessionValidationInfo } from '../ports/session.gateway.port';

export class SubmissionDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubmissionDomainError';
  }
}

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
    public readonly classId: string,
    public readonly className: string,
    public status: 'IN_PROGRESS' | 'FINISHED',
    public readonly sessionId?: string, 
    public readonly answers?: any[]
  ) {}

  // 🔥 PERBAIKAN 1: Validasi menggunakan classId
  public validateEligibilityToStart(session: SessionValidationInfo): void {
    console.log('status: ', this.status);
    
    if (this.status === 'FINISHED') {
      throw new SubmissionDomainError('Anda sudah menyelesaikan ujian ini.');
    }

    const now = new Date().getTime();
    if (session.endTime.getTime() < now) {
      console.log('now: ',now);
      console.log('session.endTime: ',session.endTime.getTime());
      
      throw new SubmissionDomainError('Waktu sesi ujian sudah habis! Anda terlambat.');
    }

    const allowedClasses = session.classIds || [];
    // ✅ Bandingkan Array UUID dari Session dengan UUID siswa
    if (!allowedClasses.includes(this.classId)) { 
       throw new SubmissionDomainError('Sesi ujian ini tidak dibuka untuk kelas Anda.');
    }
  }

  static createNew(dto: StartSubmissionDTO, assessmentId: string, sessionId: string): SubmissionDomain {
    return new SubmissionDomain(
      'akan-di-generate-db',
      assessmentId,
      dto.student_name,
      dto.class_id,
      dto.class_name,
      'IN_PROGRESS',
      sessionId
    );
  }

  // 🔥 PERBAIKAN 2: Logika Waktu yang tidak bentrok
  public validateCanAnswer(
    questionAssessmentId: string, 
    sessionEndTime: Date | undefined | null,
    currentTime: Date = new Date()
  ): void {
    
    if (this.status === 'FINISHED') {
      throw new SubmissionDomainError("Ujian sudah ditutup.");
    }

    if (this.assessmentId !== questionAssessmentId) {
      throw new SubmissionDomainError("Pertanyaan ini bukan bagian dari ujian ini!");
    }

    if (!sessionEndTime) {
      throw new SubmissionDomainError('Konfigurasi waktu ujian invalid');
    }

    const GRACE_PERIOD_MS = 2 * 60 * 1000; // 2 menit toleransi ngelag
    const strictDeadline = sessionEndTime.getTime();
    const graceDeadline = strictDeadline + GRACE_PERIOD_MS;
    const now = currentTime.getTime();

    if (now > graceDeadline) {
       // Keterlambatan fatal (> 2 menit) -> Server harus panggil auto-finish
       throw new SubmissionTimeoutError("Waktu ujian telah habis secara absolut! Jawaban tidak tersimpan.");
    } else if (now > strictDeadline) {
       // Opsional: Jika masih dalam grace period, biarkan lewat atau beri flag.
       // (Disini kita biarkan lewat karena tujuan grace period adalah menoleransi jaringan yang lemot saat diklik "Kumpul")
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