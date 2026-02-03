export interface AssessmentTypes {
    id: string;
    title: string;
    duration: number;
    assessment_status: string;
    description?: string;
    _count?: { questions: number };
}