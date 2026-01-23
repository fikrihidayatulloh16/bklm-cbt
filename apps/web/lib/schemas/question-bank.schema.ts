// lib/schemas/question-form.schema.ts
import { z } from "zod";

// Schema untuk SATU Soal
export const questionItemSchema = z.object({
  text: z.string().min(1, "Pertanyaan wajib diisi"),
  type: z.enum(["MULTIPLE_CHOICE", "YES_NO", "ESSAY"]),
  // Opsi boleh kosong jika Essay
  options: z.array(z.object({
    label: z.string(),
    score: z.number()
  })).optional() 
});

// Schema untuk SATU Kategori (Section)
export const categorySectionSchema = z.object({
  categoryName: z.string().min(1, "Nama kategori wajib diisi"),
  questions: z.array(questionItemSchema)
});

// Schema UTAMA Form UI
export const questionBankFormSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().optional(),
  // Disini bedanya: Kita pakai 'sections' bukan 'questions' langsung
  sections: z.array(categorySectionSchema)
});

export type QuestionBankFormValues = z.infer<typeof questionBankFormSchema>;