import api from "@/lib/api";
import { QuestionBankListType, QuestionDetailType, QuestionBankDetailType, CreateQuestionBankPayload, EditQBPayloadArgs } from "../types/question-bank.types";

const ENDPOINTS = {
    QUESTIONBANK: '/question-bank',
    QBDETAIL: (questionBankId: string) => `/question-bank/${questionBankId}`
}

export const getQuestionBankList = async (): Promise<QuestionBankListType> => {
    const data = await api.get(ENDPOINTS.QUESTIONBANK)
    return data.data
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