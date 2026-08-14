// domain/assessment.entity.ts
// 1. 🔥 DEFINISIKAN TIPE STATUS DI SINI (Tanpa Prisma)
export type AssessmentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export class Assessment {
  private constructor(
    private _title: string,              // Posisi 1
    private _description: string | null, // Posisi 2
    private _durationMs: number,         // Posisi 3
    private readonly _authorId: string,  // Posisi 4
    private _schoolId?: string,          // Posisi 5
    private _status: AssessmentStatus = 'DRAFT', // Posisi 6
    private _id?: string,                // Posisi 7
    private _questions: any[] = []       // Posisi 8
  ) {}

  // Factory yang sangat sederhana
  public static createNew(
    title: string, 
    durationMinutes: number, 
    authorId: string, 
    schoolId?: string,
    description?: string
  ): Assessment {
    const durationMs = durationMinutes * 60000;
    
    if (durationMs <= 0) {
      throw new Error("DomainError: Durasi ujian wajib lebih dari nol");
    }

    return new Assessment(title, description ?? null, durationMs, authorId, schoolId);
  }

  public publish() {
    // 1. Cek status dulu
    if (this._status === 'PUBLISHED') {
      throw new Error("DomainError: Assessment sudah di-publish, silakan tunggu hingga selesai.");
    }
    
    // 2. Cek durasi (Letakkan di atas pengecekan soal agar sesuai dengan harapan Test E2E)
    if (!this._durationMs || this._durationMs <= 0) {
      throw new Error("DomainError: Durasi ujian belum diatur");
    }

    // 3. Cek jumlah soal
    if (!this._questions || this._questions.length === 0) {
      throw new Error("DomainError: Tidak bisa mem-publish ujian yang belum memiliki soal.");
    }

    this._status = 'PUBLISHED';
  }

  // 🔥 PINTU REHIDRASI: Membangkitkan kembali Entity dari Database
  public static fromDatabase(
    id: string,
    title: string,
    description: string | null,
    durationMs: number,
    authorId: string,
    status: AssessmentStatus,
    schoolId?: string,
    questions: any[] = []
  ): Assessment {
    // 2. 🔥 PASTIKAN URUTANNYA SAMA PERSIS DENGAN CONSTRUCTOR DI ATAS
    return new Assessment(
      title,          // Posisi 1
      description,    // Posisi 2 👈 SOLUSI ERROR 2: Pastikan ini string | null
      durationMs,     // Posisi 3 👈 Pastikan ini number
      authorId,       // Posisi 4
      schoolId,       // Posisi 5
      status,         // Posisi 6
      id,             // Posisi 7
      questions       // Posisi 8
    );
  }

  public attachQuestions(questions: any[]) {
    this._questions = questions;
  }

  // =======================================================
  // 3. KUMPULAN GETTERS (Jawaban dari semua error Anda)
  // Semua yang dipanggil di Repositori harus ada Getter-nya
  // =======================================================
  get id() { return this._id; }
  get title() { return this._title; }
  get description() { return this._description; } 
  get durationMs() { return this._durationMs; }
  get authorId() { return this._authorId; }       
  get schoolId() { return this._schoolId; }       
  get status() { return this._status; }           
  get questions() { return this._questions; }
}