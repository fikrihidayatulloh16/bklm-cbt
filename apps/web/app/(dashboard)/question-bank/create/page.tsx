'use client';

import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Accordion, AccordionItem, Button, Input, useDisclosure } from "@nextui-org/react";
import { Plus, Save, Layers, Trash2 } from "lucide-react";
import { questionBankFormSchema, QuestionBankFormValues } from "@/lib/schemas/question-bank.schema";
import CategorySectionBody from "@/components/fragments/question-bank/CategorySection";
import { transformFormToPayload } from "@/lib/utils/form-transformers";
import CreateCategoryQuestionModal from "@/components/fragments/question-bank/modal/addCat.modal";
import api from "@/lib/api";
import { useState } from "react";
import { showToast } from "@/components/ui/toast/toast-trigger";

export default function CreateQuestionBankPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { control, register, handleSubmit, setValue, formState: { errors } } = useForm<QuestionBankFormValues>({
    resolver: zodResolver(questionBankFormSchema),
    defaultValues: {
      title: "",
      sections: [] // Mulai kosong
    }
  });

  // Array untuk mengelola Section (Kategori)
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sections"
  });

  const onSubmit = async (data: QuestionBankFormValues) => {
    setIsLoading(true);
    // ✨ TRANSFORMASI DATA ✨
    // Ubah struktur Nested UI menjadi Flat Backend Payload
    const payload = transformFormToPayload(data);

    try {      
      await api.post('/question-bank', payload);
      router.push('/question-bank'); // Kembali ke list
      router.refresh();
      showToast({
        type: "success",
        message: "Berhasil",
        description: "Berhasil disimpan!",
      });
    } catch (e) {
        showToast({
          type: "danger",
          message: "Gagal",
          description: "Gagal simpan bank soal!",
        });
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi yang akan dipanggil oleh Modal
  const handleAddCategoryFromModal = (categoryName: string, questions: any[]) => {
    console.log("Menerima data dari modal:", categoryName, questions);
     // DISINI logic append yang benar dijalankan
     append({
        categoryName: categoryName,
        questions: questions
     });

     console.log("Data berhasil di-append!");
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

      {/* AREA UTAMA: LIST KATEGORI */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
           <h3 className="text-lg font-bold flex gap-2 items-center">
             <Layers /> Daftar Kategori
           </h3>

              
              <Button 
                size="sm" 
                variant="flat" 
                color="primary" 
                startContent={<Plus size={16}/>}
                onPress={onOpen} // Buka Modal
              >
                Tambah Kategori
              </Button>

        </div>

        <Accordion variant="splitted" selectionMode="multiple">
          {fields.map((sectionField, index) => (
            <AccordionItem
              key={sectionField.id}
              aria-label={`Kategori ${index + 1}`}
              // KITA DEFINISIKAN TITLE (HEADER) DISINI
              title={
                <div className="flex gap-4 items-center pr-4">
                  <Input 
                    {...register(`sections.${index}.categoryName`)}
                    placeholder="Nama Kategori (misal: Visual)" 
                    variant="underlined"
                    className="max-w-xs font-bold"
                    color="primary"
                    // PENTING: Stop Propagation agar saat ngetik accordion tidak nutup/buka
                    onClick={(e) => e.stopPropagation()} 
                    onKeyDown={(e) => e.stopPropagation()}
                    isInvalid={!!errors.sections?.[index]?.categoryName}
                    errorMessage={errors.sections?.[index]?.categoryName?.message}
                  />
                  <div className="flex-grow" />
                  <Button 
                    isIconOnly size="sm" color="danger" variant="light" 
                    onPress={() => remove(index)}
                  >
                    <Trash2 size={18}/>
                  </Button>
                </div>
              }
            >
              {/* KONTEN BODY (Daftar Soal) dipanggil disini */}
              <CategorySectionBody 
                control={control}
                register={register}
                setValue={setValue}
                errors={errors}
                sectionIndex={index} 
                removeSection={function (index: number): void {
                  throw new Error("Function not implemented.");
                } }              />
            </AccordionItem>
          ))}
        </Accordion>

        {fields.length === 0 && (
           <div className="text-center py-12 border-2 border-dashed rounded-xl text-gray-400">
             Belum ada kategori. Klik "Tambah Kategori Baru" untuk memulai.
           </div>
        )}
      </div>

        <CreateCategoryQuestionModal
          onOpenChange={onOpenChange}
          isOpen={isOpen}
          onAddCategory={handleAddCategoryFromModal}
        />


    </div>
  );
}