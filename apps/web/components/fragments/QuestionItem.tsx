'use client';

import { Card, CardBody, Input, Button } from "@nextui-org/react";
import { Trash2 } from "lucide-react";
import { UseFormRegister, FieldErrors, Control } from "react-hook-form"; // Tambah import Control
import { QuestionBankFormValues } from "@/lib/schemas/question-bank.schema";
import OptionList from "./OptionList"; // Import komponen baru

interface QuestionItemProps {
  index: number;
  register: UseFormRegister<QuestionBankFormValues>;
  control: Control<any>; // Tambah props Control
  errors: FieldErrors<QuestionBankFormValues>;
  remove: (index: number) => void;
}

export default function QuestionItem({ index, register, control, errors, remove }: QuestionItemProps) {
  const questionError = errors.questions?.[index];

  return (
    <Card className="bg-default-50 border border-default-200 mb-4">
      <CardBody className="gap-4">
        {/* Header dan Input Text/Category (TIDAK BERUBAH DARI SEBELUMNYA) */}
        <div className="flex justify-between items-start">
          <span className="font-bold text-default-500 bg-default-200 px-2 py-1 rounded text-sm">
            No. {index + 1}
          </span>
          <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => remove(index)}>
            <Trash2 size={18} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
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
          <div>
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
        </div>
        
        <input type="hidden" {...register(`questions.${index}.type`)} value="MULTIPLE_CHOICE" />
        
        {/* --- BAGIAN INI YANG KITA UBAH --- */}
        {/* Hapus div placeholder lama, ganti dengan OptionList */}
        <div className="p-4 bg-white rounded-lg border border-default-200">
           <p className="text-xs font-bold text-default-400 mb-2 uppercase">Pilihan Jawaban & Skor</p>
           <OptionList nestIndex={index} control={control} />
        </div>
        {/* -------------------------------- */}

      </CardBody>
    </Card>
  );
}