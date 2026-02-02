export interface DashboardStats {
    totalAssessment: number;
    totalQuestion: number;
    totalQuestionBank: number;
    totalSubmissions: number;
}

export interface LastAssessment {
    id: string;
    title: string;
    duration: number;
    assessment_status: string;
    description?: string;
    _count?: { questions: number };
}

export interface LastQuestionBank {
    id: string;
    title: string;
    description: string;
    shared: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    question_count: number;
}

// Response Wrapper (Jika backend Anda membungkus data dengan { data: ... })
export interface ApiResponse<T> {
  data: T;
  message?: string;
}