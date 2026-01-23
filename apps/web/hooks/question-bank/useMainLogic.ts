import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { questionBankSchema, QuestionBankFormValues } from "@/lib/schemas/question-bank.schema";
import { Button, Input } from "@nextui-org/react";
import { Plus, Save } from "lucide-react";
import QuestionItem from "@/components/fragments/QuestionItem";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateQuestionBankPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

 

  // Function Submit
  const onSubmit: SubmitHandler<QuestionBankFormValues> = async (data) => {
    setIsLoading(true);
    try {
      // 1. Kirim Data ke Backend
      // Pastikan endpoint backend Anda benar (misal: /question-banks)
      const response = await api.post('/question-bank', data); 
      // Catatan: Cek lagi di NestJS controller, endpoint-nya '/assessments' atau '/question-banks'? 
      // Jika Anda belum buat endpoint khusus QuestionBank, kita bisa pakai struktur yang ada dulu.
      
      // 2. Redirect atau Beri Notifikasi
      alert("Bank Soal berhasil dibuat!"); // Nanti ganti Toast
      router.push('/question-bank'); // Kembali ke list
      router.refresh();

    } catch (error: any) {
      console.error("Gagal menyimpan:", error);
      alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    onSubmit
  }
}