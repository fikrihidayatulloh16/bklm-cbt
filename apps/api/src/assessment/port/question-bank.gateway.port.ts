// apps/api/src/assessment/port/question-bank.gateway.port.ts
export const I_QUESTION_BANK_GATEWAY = 'IQuestionBankGateway';

// Gunakan tipe Any untuk fleksibilitas sementara, atau import tipe asli Anda
export interface QuestionBankResponse {
  id: string;
  // property bank lainnya...
  questions: any[]; // 👈 UBAH DARI string[] MENJADI any[]
}

export interface IQuestionBankGateway {
  // Ubah parameternya menjadi ID Bank Soal, bukan User ID, 
  // karena saat create assessment kita menarik 1 spesifik Bank Soal
  findOneQbId(bankId: string): Promise<QuestionBankResponse | null>; 
}