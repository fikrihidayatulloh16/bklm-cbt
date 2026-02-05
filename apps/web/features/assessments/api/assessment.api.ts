import api from "@/lib/api";
import { 
    ListAssessmentSchema, 
    ListAssessmentTypes, 
    createAssessmentFromBankPayload, 
    createAssessmentFromBankPayloadType,
    AssessmentDetailType, 
    AssessmentDetailSchema, 
    DistinctClassSchema,
    SubmissionSchema,
    QuestionAnalyticSchema,
    SubmissionType,
    QuestionAnalyticType
} from "../schemas/assessment.schemas";
import z, { check } from "zod";
import { error } from "console";

const ENCPOINTS = {
    ASSESSMENTLIST: '/assessments/',
    POSTASSESSMENTFROMBANK: '/assessments/from-bank'
}

export const getListAssessment = async (): Promise<ListAssessmentTypes[]> => {
    const { data } = await api.get(ENCPOINTS.ASSESSMENTLIST);

    const result = z.array(ListAssessmentSchema).safeParse(data);

    if (!result.success) {
        console.error("❌ API Response tidak sesuai schema!", result.error);
        throw new Error('Struktur Data Backend Tidak Sesuai Schema')
    }

    return result.data
}

export const createAssessmentFromBank = async (payload: createAssessmentFromBankPayloadType): Promise<void> => {
    const validation = createAssessmentFromBankPayload.safeParse(payload)

    if (!validation.success) {
        console.error("❌ Data Payload Invalid:", validation.error);
        throw new Error('Validasi Gagal: Data tidak sesuai format.')
    }

    await api.post(ENCPOINTS.POSTASSESSMENTFROMBANK, validation.data)
}

// 1. Get Detail
export const getAssessmentDetail = async (id: string): Promise<AssessmentDetailType> => {
  const { data } = await api.get(`/assessments/${id}`);
  return AssessmentDetailSchema.parse(data);
};

// 2. Get Classes
export const getDistinctClasses = async (id: string): Promise<string[]> => {
  const { data } = await api.get(`/assessments/${id}/distinct-class`);
  return DistinctClassSchema.parse(data);
};

// 3. Get Submissions (Support Filter)
export const getAssessmentSubmissions = async (id: string, className?: string): Promise<SubmissionType[]> => {
  const { data } = await api.get(`/assessments/${id}/results`, {
    params: { class_name: className } // Axios otomatis handle encodeURI
  });
  // Asumsi response backend: { submissions: [...] }
  return z.array(SubmissionSchema).parse(data.submissions || []);
};

// 4. Get Analytics (Support Filter)
export const getAssessmentAnalytics = async (id: string, className?: string): Promise<QuestionAnalyticType[]> => {
  const { data } = await api.get(`/assessments/${id}/analytics`, {
    params: { class_name: className }
  });
  
  // Asumsi response backend: { question_analysis: [...] }
  return z.array(QuestionAnalyticSchema).parse(data.question_analysis || []);
};

// 5. Publish
export const publishAssessment = async (id: string): Promise<void> => {
  await api.patch(`/assessments/${id}/publish`);
};