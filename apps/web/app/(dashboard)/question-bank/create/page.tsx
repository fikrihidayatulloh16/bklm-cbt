'use client';

import { Button, Input, Accordion, AccordionItem } from "@nextui-org/react";
import { Plus, Save, Layers, Trash2 } from "lucide-react";

// Components
import CategorySectionBody from "@/components/fragments/question-bank/CategorySection";
import CreateCategoryQuestionModal from "@/components/fragments/question-bank/modal/addCat.modal";

// Hooks
import { useQBCreateLogic } from "@/features/question-bank/hooks/useQBCreateLogic";

export default function CreateQuestionBankPage() {
  // Panggil Logic dari Hook
  const { 
    form, 
    fields, 
    removeSection, 
    handleSubmit, 
    handleAddCategoryFromModal, 
    modalProps, 
    isSubmitting 
  } = useQBCreateLogic();

  // Destructure form methods biar coding di JSX lebih pendek
  const { register, control, setValue, formState: { errors } } = form;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Desain Instrumen</h1>
        <Button 
          color="primary" 
          startContent={<Save size={18}/>}
          isLoading={isSubmitting}
          onPress={() => handleSubmit()} // Tidak perlu arrow function lagi
        >
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>

      {/* METADATA FORM */}
      <div className="bg-white p-6 rounded-xl border border-default-200 shadow-sm space-y-4">
        <Input 
          {...register("title")}
          label="Judul Instrumen" 
          placeholder="Contoh: Gaya Belajar" 
          variant="bordered"
          isInvalid={!!errors.title}
          errorMessage={errors.title?.message}
        />
        <Input 
          {...register("description")}
          label="Deskripsi" 
          placeholder="Deskripsi singkat..." 
          variant="bordered"
        />
      </div>

      {/* LIST KATEGORI SECTION */}
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
             onPress={modalProps.onOpen}
           >
             Tambah Kategori
           </Button>
        </div>

        <Accordion variant="splitted" selectionMode="multiple">
          {fields.map((sectionField, index) => (
            <AccordionItem
              key={sectionField.id}
              aria-label={`Kategori ${index + 1}`}
              title={
                <div className="flex gap-4 items-center pr-4">
                  {/* Input Nama Kategori di Header Accordion */}
                  <Input 
                    {...register(`sections.${index}.categoryName`)}
                    placeholder="Nama Kategori" 
                    variant="underlined"
                    className="max-w-xs font-bold"
                    color="primary"
                    // Prevent accordion toggle saat ngetik
                    onClick={(e) => e.stopPropagation()} 
                    onKeyDown={(e) => e.stopPropagation()}
                    isInvalid={!!errors.sections?.[index]?.categoryName}
                    errorMessage={errors.sections?.[index]?.categoryName?.message}
                  />
                  <div className="flex-grow" />
                  
                  {/* Tombol Hapus Section */}
                  <Button 
                    isIconOnly size="sm" color="danger" variant="light" 
                    onPress={() => removeSection(index)}
                  >
                    <Trash2 size={18}/>
                  </Button>
                </div>
              }
            >
              {/* Body Section: List Soal */}
              <CategorySectionBody 
                control={control}
                register={register}
                setValue={setValue}
                errors={errors}
                sectionIndex={index} 
                // removeSection dilempar ke child jika child butuh (opsional)
                removeSection={() => removeSection(index)} 
              />
            </AccordionItem>
          ))}
        </Accordion>

        {/* Empty State */}
        {fields.length === 0 && (
           <div className="text-center py-12 border-2 border-dashed rounded-xl text-gray-400">
             Belum ada kategori. Klik "Tambah Kategori" untuk memulai.
           </div>
        )}
      </div>

      {/* MODAL */}
      <CreateCategoryQuestionModal
        isOpen={modalProps.isOpen}
        onOpenChange={modalProps.onOpenChange}
        onAddCategory={handleAddCategoryFromModal}
      />

    </div>
  );
}