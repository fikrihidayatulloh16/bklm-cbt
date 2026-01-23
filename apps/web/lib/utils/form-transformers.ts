// lib/utils/form-transformers.ts
import { QuestionBankFormValues } from "@/lib/schemas/question-bank.schema";

export const transformFormToPayload = (formData: QuestionBankFormValues) => {
  // Kita "ratakan" (flatten) section kembali menjadi satu array questions panjang
  // untuk dikirim ke Backend sesuai DTO yang lama.
  
  const flatQuestions = formData.sections.flatMap((section) => {
    return section.questions.map((q) => ({
      ...q,
      category: section.categoryName, // Inject nama kategori ke setiap soal
      // Pastikan options ada (default empty array)
      options: q.options || [] 
    }));
  });

  return {
    title: formData.title,
    description: formData.description,
    questions: flatQuestions
  };
};