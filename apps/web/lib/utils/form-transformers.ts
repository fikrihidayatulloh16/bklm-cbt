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

// 1. DARI BACKEND KE FORM (Untuk inisialisasi Default Values)
export const transformBackendToForm = (backendData: any): QuestionBankFormValues => {
  // Grouping questions by category
  const groupedSections: Record<string, any[]> = {};

  backendData.questions.forEach((q: any) => {
    const cat = q.category || "Uncategorized";
    if (!groupedSections[cat]) {
      groupedSections[cat] = [];
    }
    groupedSections[cat].push({
      id: q.id, // PENTING: ID harus ikut
      text: q.text,
      type: q.type,
      options: q.options.map((opt: any) => ({
        id: opt.id, // PENTING: ID Opsi harus ikut
        label: opt.label,
        score: opt.score,
        order: opt.order
      }))
    });
  });

  // Convert Object ke Array untuk React Hook Form
  const sections = Object.keys(groupedSections).map((catName) => ({
    categoryName: catName,
    questions: groupedSections[catName]
  }));

  return {
    title: backendData.title,
    description: backendData.description,
    // shared: backendData.shared,
    // @ts-ignore - Karena schema form kita pakai 'sections', tapi zod aslinya 'questions'
    // Kita perlu sedikit trik di sini atau sesuaikan Zod schema Anda untuk menerima 'sections' di UI only
    sections: sections, 
  };
};

// 2. DARI FORM KE BACKEND (Untuk Submit ke API)
export const transformFormToBackend = (formData: any) => {
  // Kita harus FLATTEN (ratakan) sections kembali menjadi satu array questions
  const flatQuestions: any[] = [];

  formData.sections.forEach((section: any) => {
    section.questions.forEach((q: any) => {
      flatQuestions.push({
        ...q,
        category: section.categoryName, // Masukkan nama kategori ke tiap soal
        // ID options dan ID soal sudah otomatis terbawa dari form
      });
    });
  });

  return {
    ...formData,
    questions: flatQuestions, // Kirim array flat ke backend
  };
};