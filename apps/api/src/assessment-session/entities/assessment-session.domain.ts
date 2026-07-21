export class AssessmentSessionDomain {
  constructor(
    public id: string,
    public name: string,
    public startTime: Date,
    public endTime: Date,
    public assessmentId: string,
    public classIds?: string[], // ID kelas yang diizinkan ikut
  ) {}

  // Kehebatan OOP Domain: Logika bisnis ditempatkan di sini!
  // Kita bisa mengecek apakah ujian sedang berlangsung tanpa mengotori Service.
  get isActive(): boolean {
    const now = new Date();
    return now >= this.startTime && now <= this.endTime;
  }

  get isUpcoming(): boolean {
    const now = new Date();
    return now < this.startTime;
  }
}