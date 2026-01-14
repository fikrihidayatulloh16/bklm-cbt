'use client';

import { useFieldArray, Control } from "react-hook-form";
import { Button, Input, Checkbox } from "@nextui-org/react";
import { Plus, Trash2 } from "lucide-react";
import { QuestionBankFormValues } from "@/lib/schemas/question-bank.schema";

interface OptionListProps {
  nestIndex: number; // Ini index milik Pertanyaan (Soal ke-0, ke-1, dst)
  control: Control<any>; // "Otak" form yang kita oper dari atas ------- masih tidak paham fungsi control
}

export default function OptionList({ nestIndex, control }: OptionListProps) {
  // Kita bikin array dinamis LAGI, tapi kali ini targetnya specific:
  // questions[0].options, questions[1].options, dst...
  const { fields, append, remove } = useFieldArray({ //-------------apakah field  - remove adalah bawaan
    control, 
    name: `questions.${nestIndex}.options`
  });

  return (
    <div className="space-y-3">
      {fields.map((item, k) => (
        <div key={item.id} className="flex gap-2 items-center">
          {/* Label Opsi (A, B, C...) */}
          <div className="flex-none w-8 text-center font-bold text-default-400">
            {String.fromCharCode(65 + k)}. 
          </div>

          {/* Input Teks Jawaban */}
          <Input
            // Cara register manual tanpa hook 'register' (pake control lebih aman utk nested)
            {...control.register(`questions.${nestIndex}.options.${k}.label`)}
            placeholder={`Pilihan ${String.fromCharCode(65 + k)}`}
            size="sm"
            variant="flat"
          />

          {/* Input Score (Bobot Nilai) */}
          <Input
            {...control.register(`questions.${nestIndex}.options.${k}.score`)} //------ ada yag pakai control ada yang tidak bedanya apa
            type="number"
            placeholder="Skor"
            className="w-20"
            size="sm"
            variant="flat"
          />

          {/* Tombol Hapus Opsi */}
          <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => remove(k)}>
            <Trash2 size={16} />
          </Button>
        </div>
      ))}

      <Button
        size="sm"
        variant="light"
        color="primary"
        startContent={<Plus size={16} />}
        onPress={() => append({ label: "", score: 0 })}
      >
        Tambah Pilihan
      </Button>
    </div>
  );
}