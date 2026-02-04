import api from "@/lib/api";
import { ListAssessmentSchema, ListAssessmentTypes, createAssessmentFromBankPayload, createAssessmentFromBankPayloadType } from "../schemas/assessment.schemas";
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