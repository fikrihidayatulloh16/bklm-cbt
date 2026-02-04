import { title } from "process";
import { string, z } from "zod";

export const ListAssessmentSchema = z.object({
    id: z.string(),
    title: z.string().nullable().transform(val => val ?? ""),
    duration: z.number().or(z.string()).transform(val => Number(val)),
    assessment_status: z.string().min(1, "Status Wajib Diisi"),
    description: z.string().nullable().transform(val => val ?? ""),
    _count: z.object({
        questions: z.number()
    }).optional().transform(val => Number(val) ?? 0)
})

export type ListAssessmentTypes = z.infer<typeof ListAssessmentSchema> // type dari schema

export const createAssessmentFromBankPayload = z.object({
    title: z.string().min(1, "Judul Wajib Diisi"),
    description: z.string().optional().default(""),
    duration: z.coerce.number().min(1, "Durasi minimal 1 menit").catch(60), // jika nilainya = "1" string, bisakah zod ubah jadi 1 berupa nomor?
    question_bank_id: z.string().min(1, "Wajib"),
    school_id: z.string().optional().default(""),
})

export type createAssessmentFromBankPayloadType = z.infer<typeof createAssessmentFromBankPayload>

export type AssessmentFormValues = {
    title: string;
    description?: string;        // ✅ Boleh undefined
    duration: number | string;   // ✅ Boleh string (dari input) atau number
    question_bank_id: string;
    school_id?: string;
}