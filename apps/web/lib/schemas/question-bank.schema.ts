import { z } from "zod";

export const optionSchema = z.object({
  label: z.string().min(1, "Label opsi wajib diisi"),
  score: z.coerce.number().default(0), 
});

export const questionSchema = z.object({
  text: z.string().min(5, "Pertanyaan minimal 5 karakter"),
  category: z.string().min(1, "Kategori wajib diisi"), 
  // UPDATE DISINI: Tambahkan "YES_NO" ke dalam Enum
  type: z.enum(["MULTIPLE_CHOICE", "ESSAY", "YES_NO"]), 
  options: z.array(optionSchema).default([]), 
});

// ... Sisanya sama ...
export const questionBankSchema = z.object({
  title: z.string().min(5, "Judul Instrumen minimal 5 karakter"),
  description: z.string().default(""), 
  questions: z.array(questionSchema).default([]), 
});

export type QuestionBankFormValues = z.infer<typeof questionBankSchema>;