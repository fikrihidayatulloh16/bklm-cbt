import api from "@/lib/api";
import { QuestionBankListType, QuestionDetailType, QuestionBankDetailType, CreateQuestionBankPayload, EditQBPayloadArgs } from "../types/question-bank.types";

const ENDPOINTS = {
    QUESTIONBANK: '/question-bank',
    QBDETAIL: (questionBankId: string) => `/question-bank/${questionBankId}`
}

export const getQuestionBankList = async (): Promise<QuestionBankListType[]> => {
  
  // 🚨 PERHATIKAN: Gunakan kurung kurawal { data } untuk mengekstrak isi response Axios
  const { data } = await api.get(ENDPOINTS.QUESTIONBANK);
  
  console.log("📦 Paket asli dari Backend:", data);

  // 1. Jika data itu sendiri sudah berupa array murni
  if (Array.isArray(data)) {
    return data;
  }
  
  // 2. Jika NestJS membungkusnya (contoh: { statusCode: 200, data: [...] })
  if (data && Array.isArray(data.data)) {
    return data.data;
  }

  // 3. Jika tidak dikenali
  console.warn("⚠️ Bentuk data Bank Soal tidak dikenali!", data);
  return [];
}

export const getQBDetail = async (questionBankId: string): Promise<QuestionBankDetailType> => {
    const data = await api.get(ENDPOINTS.QBDETAIL(questionBankId))
    return data.data
}

export const editQBDetail = async ({ questionBankId, payload }: EditQBPayloadArgs): Promise<QuestionBankDetailType> => {
    const response = await api.patch(ENDPOINTS.QBDETAIL(questionBankId), payload);
    return response.data;
}

export const removeOneQB = async (questionBankId: string): Promise<QuestionBankListType> => {
    const data = await api.delete(ENDPOINTS.QBDETAIL(questionBankId))
    return data.data
}

export const createQuestionBank = async (payload: CreateQuestionBankPayload): Promise<void> => {
    // Kita tidak perlu return data spesifik jika hanya create
    await api.post('/question-bank', payload);
};