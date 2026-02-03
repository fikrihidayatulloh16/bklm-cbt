import api from "@/lib/api";
import { QuestionBankListType } from "../types/question-bank.types";

const ENDPOINTS = {
    QUESTIONBANK: '/question-bank'
}

export const getQuestionBankList = async (): Promise<QuestionBankListType> => {
    const data = await api.get(ENDPOINTS.QUESTIONBANK)
    return data.data
}