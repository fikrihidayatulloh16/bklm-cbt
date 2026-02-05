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

// Schema Detail Assessment
export const AssessmentDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().transform((v) => v ?? ""),
  assessment_status: z.string(), // "DRAFT" | "PUBLISHED"
  created_at: z.string().or(z.date()),
 expired_at: z.string().or(z.date()).nullable(),
  duration: z.number(), // dalam menit
});

// Schema untuk Class List (Array of Strings)
export const DistinctClassSchema = z.array(z.string());

// Schema Submission (Sesuaikan dengan data riil submission kamu)
export const SubmissionSchema = z.object({
    id: z.string(),
    student_name: z.string(),
    class_name: z.string(),
    score: z.number(),
    status: z.enum(["FINISHED", "IN_PROGRESS"]),
    submitted_at: z.string().or(z.date()).nullable(),
});

// Schema Analytics
export const QuestionAnalyticSchema = z.object({
    // id: z.string(),
    question_id: z.string(),
    question_text: z.string(),
    category: z.string(),
    total_risk_score: z.number(),
    respondents: z.number(),
    percentageRaw: z.number(),
    percentage: z.string(),
    priority: z.string(),
    average: z.number(),
});

// Types Inference
export type AssessmentDetailType = z.infer<typeof AssessmentDetailSchema>;
export type SubmissionType = z.infer<typeof SubmissionSchema>;
export type QuestionAnalyticType = z.infer<typeof QuestionAnalyticSchema>;