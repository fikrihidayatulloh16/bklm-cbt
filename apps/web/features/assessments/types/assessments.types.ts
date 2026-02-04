export interface ListAssessmentTypes {
    id: string;
    title: string;
    duration: number;
    assessment_status: string; //atau assessmentStatus?
    description?: string;
    _count?: { questions: number };
}