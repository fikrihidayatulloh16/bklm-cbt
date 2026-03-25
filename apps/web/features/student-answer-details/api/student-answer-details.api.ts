import api from "@/lib/api";
import { StudentAnswerDetailType } from "../schema/studentAnswerDetails.schema";

const ENDPOINTS = {
    STUDENTANSWERDETAIL: (assessmentId: string, submissionId: string) => `assessments/${assessmentId}/submissions/${submissionId}/answers`
}

export const getStudentAnswerDetail = async (assessmentId: string, submissionId: string): Promise<StudentAnswerDetailType> => {
    const data = await api.get(ENDPOINTS.STUDENTANSWERDETAIL(assessmentId, submissionId))
    return data.data
}