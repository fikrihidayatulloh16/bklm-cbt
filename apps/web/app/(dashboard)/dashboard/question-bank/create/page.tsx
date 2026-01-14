'use client';

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
  // --- PERBAIKAN UTAMA DI SINI ---
  // 1. Hapus <QuestionBankFormValues> generic di sebelah useForm
  // 2. Biarkan zodResolver yang menentukan tipenya otomatis
  const { 
    control, 
    register, 
    setValue,
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(questionBankSchema),
    defaultValues: {
      title: "",
      description: "", // Sekarang string kosong, match dengan schema
      questions: [] 
    }
  });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  });

  // Function Submit
  const onSubmit: SubmitHandler<QuestionBankFormValues> = async (data) => {
    setIsLoading(true);
    try {
      // 1. Kirim Data ke Backend
      // Pastikan endpoint backend Anda benar (misal: /question-banks)
      const response = await api.post('/question-bank', data); 
      // Catatan: Cek lagi di NestJS controller, endpoint-nya '/assessments' atau '/question-banks'? 
      // Jika Anda belum buat endpoint khusus QuestionBank, kita bisa pakai struktur yang ada dulu.
      
      console.log("Berhasil disimpan:", response.data);
      
      // 2. Redirect atau Beri Notifikasi
      alert("Bank Soal berhasil dibuat!"); // Nanti ganti Toast
      router.push('/dashboard/question-bank'); // Kembali ke list
      router.refresh();

    } catch (error: any) {
      console.error("Gagal menyimpan:", error);
      alert(error.response?.data?.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Desain Instrumen</h1>
        <Button 
          color="primary" 
          startContent={<Save size={18}/>}
          // Type casting 'any' di sini aman karena kita tahu handle submit sudah benar
          onPress={() => handleSubmit(onSubmit as any)()}
        >
          Simpan
        </Button>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
        
        {/* METADATA */}
        <div className="bg-white p-6 rounded-xl border border-default-200 shadow-sm space-y-4">
          <Input 
            {...register("title")}
            label="Judul Instrumen" 
            placeholder="Contoh: Gaya Belajar" 
            variant="bordered"
            isInvalid={!!errors.title}
            errorMessage={errors.title?.message as string}
          />
          <Input 
            {...register("description")}
            label="Deskripsi" 
            placeholder="Deskripsi singkat..." 
            variant="bordered"
          />
        </div>

        {/* LIST QUESTIONS */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Daftar Pertanyaan</h3>
            <Button 
              size="sm" 
              variant="flat" 
              color="primary" 
              startContent={<Plus size={16}/>}
              onPress={() => append({ 
                text: "", 
                category: "", 
                type: "MULTIPLE_CHOICE", 
                options: [] 
              })}
            >
              Tambah Item
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <QuestionItem 
                key={field.id} 
                index={index} 
                register={register as any} 
                control={control} // <--- TAMBAHKAN INI
                errors={errors as any} 
                remove={remove} 
              />
            ))}
          </div>
          
          {fields.length === 0 && (
             <div className="text-center py-10 text-default-400 border-2 border-dashed border-default-200 rounded-xl">
               Belum ada pertanyaan.
             </div>
          )}
        </div>
      </form>
    </div>
  );
}