//apps/web/features/question-bank/schemas/question-bank.schema.ts
import { z } from "zod";

const optionSchema = z.object({
  id: z.string().optional(), // 👈 WAJIB DITAMBAHKAN UNTUK EDIT
  label: z.string(),
  score: z.number()
});

// Schema untuk SATU Soal
export const questionItemSchema = z.object({
  id: z.string().optional(), // 👈 PENTING UNTUK EDIT
  text: z.string().min(1, "Pertanyaan wajib diisi"),
  type: z.enum(["MULTIPLE_CHOICE", "YES_NO", "ESSAY"]),
  // Opsi boleh kosong jika Essay
  options: z.array(optionSchema).optional()
});

// Schema untuk SATU Soal
export const questionBankEditFormSchema = z.object({
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