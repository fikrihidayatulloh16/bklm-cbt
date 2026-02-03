import api from "@/lib/api";
import { QuestionBankListType, QuestionDetailType, QuestionBankDetailType } from "../types/question-bank.types";

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

export const removeOneQB = async (questionBankId: string): Promise<QuestionBankListType> => {
    const data = await api.delete(ENDPOINTS.QBDETAIL(questionBankId))
    return data.data
}