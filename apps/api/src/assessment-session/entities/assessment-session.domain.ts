import { v4 as uuidv4 } from 'uuid';

export class AssessmentSessionDomain {
  constructor(
    public _id: string,
    public _name: string,
    public _startTime: Date,
    public _endTime: Date,
    public _assessmentId: string,
    public _classIds?: string[], // ID kelas yang diizinkan ikut
  ) {}

  public static createAtPublish(
    assessmentId: string,
    sessionName: string,
    assessmentDurationMs: number,
    classIds: string[]
  ): AssessmentSessionDomain {
    if (classIds.length === 0) {
      throw new Error("DomainError: Minimal harus memilih 1 kelas untuk sesi ini.");
    }

    const now = new Date();
    // 🔥 PENGGANTI globalDeadline LAMA ANDA ADA DI SINI
    const endTime = new Date(now.getTime() + assessmentDurationMs); 

    return new AssessmentSessionDomain(uuidv4(), sessionName, now, endTime, assessmentId, classIds);
  }

  // Kehebatan OOP Domain: Logika bisnis ditempatkan di sini!
  // Kita bisa mengecek apakah ujian sedang berlangsung tanpa mengotori Service.
  get isActive(): boolean {
    const now = new Date();
    return now >= this._startTime && now <= this._endTime;
  }

  get isUpcoming(): boolean {
    const now = new Date();
    return now < this._startTime;
  }
}