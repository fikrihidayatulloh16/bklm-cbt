'use client';

import { useFieldArray, Control } from "react-hook-form";
import { Button, Input, Checkbox } from "@nextui-org/react";
import { Plus, Trash2 } from "lucide-react";
import { QuestionBankFormValues } from "@/features/question-bank/schemas/question-bank.schema";

interface OptionListProps {
  control: Control<any>;
  nestIndex: number;
  basePath: string; // 👈 Tambahkan ini
  register: any;    // Tambahkan ini biar mudah
  errors: any;      // Tambahkan ini
  setValue: any;    // Tambahkan ini
}

export default function OptionList({ basePath, control }: OptionListProps) {
  // Kita bikin array dinamis LAGI, tapi kali ini targetnya specific:
  // questions[0].options, questions[1].options, dst...
  const { fields, append, remove } = useFieldArray({ //-------------apakah field  - remove adalah bawaan
    control, 
    name: `questions.${basePath}.options`
  });

  return (
    <div className="space-y-3">
      {fields.map((item, k) => (
        <div key={item.id} className="flex gap-2 items-center">
          {/* Label Opsi (A, B, C...) */}
          <div className="flex-none w-8 text-center font-bold text-default-400">
            {String.fromCharCode(65 + k)}. 
          </div>

          <input type="hidden" {...control.register(`${basePath}.options.${k}.id`)} />

          {/* Input Teks Jawaban */}
          <Input
            // Cara register manual tanpa hook 'register' (pake control lebih aman utk nested)
            {...control.register(`questions.${basePath}.options.${k}.label`)}
            placeholder={`Pilihan ${String.fromCharCode(65 + k)}`}
            size="sm"
            variant="flat"
          />

          {/* Input Score (Bobot Nilai) */}
          <Input
            {...control.register(`questions.${basePath}.options.${k}.score`)} //------ ada yag pakai control ada yang tidak bedanya apa
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