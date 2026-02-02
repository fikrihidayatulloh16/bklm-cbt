import api  from "@/lib/api";
import { DashboardStats, LastAssessment, LastQuestionBank, ApiResponse } from "../types/dashboard.types";

const ENDPOINTS = {
    ASSESSMENTDASHBOARD: '/assessments/stats',
    ASSESSMENTLIST: '/assessments/',
    QUESTIONBANKSLIST: '/question-bank',
}

export const getAssessmentDashboard = async (): Promise<DashboardStats> => {
    const data = await api.get(ENDPOINTS.ASSESSMENTDASHBOARD);
    console.log('getAssessmentDashboard',data.data);
    
    return data.data;
}

export const getAssessmentList = async (): Promise<LastAssessment[]> => {
    // Ambil response utuh dulu
    const response = await api.get(ENDPOINTS.ASSESSMENTLIST);
    
    // Default: return array kosong biar ga error map
    return response.data;
}

export const getQuestionBankList = async (): Promise<LastQuestionBank[]> => {
    const data = await api.get(ENDPOINTS.QUESTIONBANKSLIST);
    return data.data;
}