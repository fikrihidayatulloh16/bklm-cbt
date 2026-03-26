//apps/web/features/question-bank/types/grouped-question-bank.types.ts
// Mewakili satu soal mentah
export interface RawQuestion {
  id: string;
  text: string;
  category: string;
  type: "MULTIPLE_CHOICE" | "YES_NO" | "ESSAY";
  options: any[]; // Sesuaikan dengan tipe option Anda
}

// Mewakili grup kategori untuk Accordion
export interface GroupedQuestionCategory {
  category: string;
  questions: RawQuestion[];
}

// Hasil akhir balikan API yang sudah digabung
export interface QuestionBankDetailResponse {
  id: string;
  title: string;
  description: string;
  groupedQuestions: GroupedQuestionCategory[]; // 👈 Ini yang akan dipakai UI
}