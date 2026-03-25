import { z } from "zod";

// Schema detail jawaban siswa
export const studentAnswerDetail = z.object({
  student_name: z.string().min(1, "Wajib punya nama"),
  gender: z.string(),
  assessment_title: z.string(),
  student_scores: z.float32(),
  questions: z.array(z.object({
    text: z.string(),
    category: z.string(),
    label: z.string().optional(), // Buat optional jika tidak selalu ada
    type: z.string(),
    score: z.number(),
    
    // UBAH INI: Alih-alih array options, langsung saja tampilkan apa jawabannya
    selected_answer: z.string().nullable(), // Contoh: "Ya", "Tidak", atau teks essay
  })).optional() 
});

export type StudentAnswerDetailType = z.infer<typeof studentAnswerDetail>;