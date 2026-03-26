export interface UpdateQuestionBankParams {
  title?: string;
  description?: string;
  shared?: boolean;
  questions?: {
    id?: string; // Kalau ada ID = Update, Kalau tidak = Create
    text: string;
    type: string;
    category: string;
    options: {
      id?: string;
      label: string;
      score: number;
      // order: number;
    }[];
  }[];
}