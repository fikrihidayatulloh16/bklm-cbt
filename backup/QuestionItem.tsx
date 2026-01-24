'use client';

import { Card, CardBody, Input, Button, Select, SelectItem } from "@nextui-org/react";
import { Trash2 } from "lucide-react";
import { UseFormRegister, FieldErrors, Control, useWatch, UseFormSetValue } from "react-hook-form"; // Tambah useWatch & setValue
import { QuestionBankFormValues } from "@/lib/schemas/question-bank.schema";
import OptionList from "./OptionList";

interface QuestionItemProps {
  index: number;
  register: UseFormRegister<QuestionBankFormValues>;
  control: Control<any>;
  errors: FieldErrors<QuestionBankFormValues>;
  remove: (index: number) => void;
  // TAMBAHAN: Kita butuh setValue untuk mengubah data secara programatikal
  setValue: UseFormSetValue<QuestionBankFormValues>;
}

export default function QuestionItem({ index, register, control, errors, remove, setValue }: QuestionItemProps) {
  const questionError = errors.questions?.[index];

  // 1. PANTAU NILAI 'TYPE' SECARA REAL-TIME
  const questionType = useWatch({
    control,
    name: `questions.${index}.type`,
    defaultValue: "MULTIPLE_CHOICE"
  });

  // 2. FUNGSI HANDLE PERUBAHAN TIPE
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as "MULTIPLE_CHOICE" | "YES_NO" | "ESSAY";
    
    // Update value di form
    setValue(`questions.${index}.type`, newType);

    // LOGIKA OTOMATIS
    if (newType === "YES_NO") {
      // Otomatis isi opsi Ya & Tidak
      setValue(`questions.${index}.options`, [
        { label: "Ya", score: 1 },
        { label: "Tidak", score: 0 }
      ]);
    } else if (newType === "MULTIPLE_CHOICE") {
      // Reset jadi kosong biar diisi manual
      setValue(`questions.${index}.options`, []);
    } else {
        // Essay -> Kosongkan opsi
        setValue(`questions.${index}.options`, []);
    }
  };

  return (
    <Card className="bg-default-50 border border-default-200 mb-4">
      <CardBody className="gap-4">
        {/* Header (No & Delete) - TETAP SAMA */}
        <div className="flex justify-between items-start">
          <span className="font-bold text-default-500 bg-default-200 px-2 py-1 rounded text-sm">
            No. {index + 1}
          </span>
          <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => remove(index)}>
            <Trash2 size={18} />
          </Button>
        </div>

        {/* INPUTS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Kolom Soal (Lebar 6) */}
          <div className="md:col-span-6">
            <Input
              {...register(`questions.${index}.text`)}
              label="Pertanyaan"
              placeholder="Tulis pertanyaan..."
              variant="bordered"
              className="bg-white"
              isInvalid={!!questionError?.text}
              errorMessage={questionError?.text?.message}
            />
          </div>
          
          {/* Kolom Kategori (Lebar 3) */}
          <div className="md:col-span-3">
            <Input
              {...register(`questions.${index}.category`)}
              label="Kategori"
              placeholder="Cth: Visual"
              variant="bordered"
              className="bg-white"
              isInvalid={!!questionError?.category}
              errorMessage={questionError?.category?.message}
            />
          </div>

          {/* Kolom Tipe Soal (Lebar 3) - UPDATE JADI SELECT */}
          <div className="md:col-span-3">
             <Select 
                label="Tipe Soal" 
                variant="bordered" 
                className="bg-white"
                selectedKeys={[questionType]} // Bind ke state
                onChange={handleTypeChange}    // Handle logic
             >
                <SelectItem key="MULTIPLE_CHOICE">Pilihan Ganda</SelectItem>
                <SelectItem key="YES_NO">Ya / Tidak</SelectItem>
                <SelectItem key="ESSAY">Esai (Uraian)</SelectItem>
             </Select>
             {/* Hidden input agar tetap ter-register di React Hook Form */}
             <input type="hidden" {...register(`questions.${index}.type`)} />
          </div>
        </div>

        {/* LOGIKA TAMPILAN OPSI */}
        {questionType === "MULTIPLE_CHOICE" && (
            <div className="p-4 bg-white rounded-lg border border-default-200">
                <p className="text-xs font-bold text-default-400 mb-2 uppercase">Pilihan Jawaban & Skor</p>
                <OptionList nestIndex={index} control={control} />
            </div>
        )}

        {questionType === "YES_NO" && (
            <div className="p-4 bg-primary-50 text-primary-600 rounded-lg border border-primary-200 text-sm flex items-center gap-2">
                <span>ℹ️ Opsi <b>Ya (Skor 1)</b> dan <b>Tidak (Skor 0)</b> akan dibuat otomatis.</span>
            </div>
        )}

        {questionType === "ESSAY" && (
            <div className="p-4 bg-default-100 rounded-lg border border-default-200 text-sm text-default-500">
                <span>ℹ️ Soal Esai tidak memerlukan opsi jawaban di sistem ini (dikoreksi manual/keyword).</span>
            </div>
        )}

      </CardBody>
    </Card>
  );
}