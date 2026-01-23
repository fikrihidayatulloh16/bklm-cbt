// components/fragments/CategorySection.tsx
'use client';

import { useFieldArray, Control, UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Button, Input } from "@nextui-org/react";

import QuestionItem from "./QuestionItem"; // Component lama Anda
import { QuestionBankFormValues } from "@/lib/schemas/question-bank.schema";
import { Plus } from "lucide-react";

interface CategorySectionProps {
  control: Control<QuestionBankFormValues>;
  register: UseFormRegister<QuestionBankFormValues>;
  setValue: UseFormSetValue<QuestionBankFormValues>;
  errors: FieldErrors<QuestionBankFormValues>;
  sectionIndex: number;
  removeSection: (index: number) => void;
}

export default function CategorySectioBody({ 
  control, register, setValue, errors, sectionIndex, removeSection 
}: CategorySectionProps) {
  
  // Nested Field Array: Mengurus questions DI DALAM section ini saja
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.questions`
  });

  return (
    <div className="space-y-4 px-2 pb-4">
      {fields.map((field, qIndex) => (
        <QuestionItem 
          key={field.id}
          control={control}
          register={register}
          setValue={setValue}
          errors={errors}
          // Path dinamis
          basePath={`sections.${sectionIndex}.questions.${qIndex}`} 
          onRemove={() => remove(qIndex)}
          index={qIndex}
        />
      ))}

      <Button 
        fullWidth 
        variant="bordered" 
        className="border-dashed border-2"
        startContent={<Plus size={16}/>}
        onPress={() => append({ 
          text: "", 
          type: "MULTIPLE_CHOICE", 
          options: [] 
        })}
      >
        Tambah Soal di Kategori Ini
      </Button>
    </div>
  );
}