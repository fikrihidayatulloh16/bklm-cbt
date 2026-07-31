// domain/assessment.entity.ts
export class Assessment {
  private constructor(
    private _title: string,
    private _durationMs: number,
    private readonly _authorId: string,
    private _description?: string,
    private _schoolId?: string,
    private _status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' = 'DRAFT',
    private _id?: string, // 👈 Opsional! Karena belum masuk DB
    private _questions: any[] = []
  ) {}

  // Factory yang sangat sederhana
  public static createNew(
    title: string, 
    durationMinutes: number, 
    authorId: string, 
    schoolId?: string
  ): Assessment {
    const durationMs = durationMinutes * 60000;
    
    if (durationMs <= 0) {
      throw new Error("DomainError: Durasi ujian wajib lebih dari nol");
    }

    return new Assessment(title, durationMs, authorId, schoolId);
  }

  public publish() {
    if (this._status === 'PUBLISHED') {
      throw new Error("DomainError: Assessment sudah di-publish, silakan tunggu hingga selesai.");
    }
    
    // Sabuk pengaman bisnis ekstra (Opsional tapi sangat direkomendasikan)
    if (this._questions && this._questions.length === 0) {
      throw new Error("DomainError: Tidak bisa mem-publish ujian yang belum memiliki soal.");
    }

    this._status = 'PUBLISHED';
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