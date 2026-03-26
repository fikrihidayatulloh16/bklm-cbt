'use client';

import { Button, Input, Accordion, AccordionItem, Spinner } from "@nextui-org/react";
import { Plus, Save, Layers, Trash2 } from "lucide-react";

// Components (Gunakan komponen yang sama persis dengan Create)
import CategorySectionBody from "@/features/question-bank/components/CategorySection";
import CreateCategoryQuestionModal from "@/features/question-bank/components/addCat.modal";

// Hooks
import { useQBEditLogic } from "@/features/question-bank/hooks/useQBEditLogic";
import { useParams } from "next/navigation";

export default function EditQuestionBankPage() {
    // 2. Ambil ID dari URL menggunakan useParams
    const params = useParams();
    const editQuestionBankId = params.editQuestionBankId as string;


  // Panggil Logic Edit yang sudah kita sempurnakan
  const { 
    form, 
    fields, 
    removeSection, 
    onSubmit, // Fungsi kirim payload (flattening) yang kita bahas sebelumnya
    // Pastikan hook Anda me-return fungsi modal ini (sama seperti di useQBCreateLogic)
    handleAddCategoryFromModal, 
    modalProps, 
    isFetching,
    // isSubmitting // (Opsional jika Anda menambahkan state loading saat submit)
  } = useQBEditLogic(editQuestionBankId);

  const { register, control, setValue, handleSubmit, formState: { errors } } = form;

  // Tampilkan spinner utuh saat form sedang diisi data dari API
  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" label="Menyiapkan data instrumen..." color="primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Instrumen</h1>
        <Button 
          color="primary" 
          startContent={<Save size={18}/>}
          // isLoading={isSubmitting}
          onClick={handleSubmit(onSubmit, (errors) => {
              console.error("VALIDASI FORM GAGAL! Ini penyebabnya:", errors);
          })}
        >
          Simpan Perubahan
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
             onPress={modalProps?.onOpen}
           >
             Tambah Kategori
           </Button>
        </div>

        <Accordion variant="splitted" selectionMode="multiple" defaultExpandedKeys="all">
          {fields.map((sectionField, index) => (
            <AccordionItem
              key={sectionField.id}
              aria-label={`Kategori ${index + 1}`}
              title={
                <div className="flex gap-4 items-center pr-4">
                  <Input 
                    {...register(`sections.${index}.categoryName`)}
                    placeholder="Nama Kategori" 
                    variant="underlined"
                    className="max-w-xs font-bold"
                    color="primary"
                    onClick={(e) => e.stopPropagation()} 
                    onKeyDown={(e) => e.stopPropagation()}
                    isInvalid={!!errors.sections?.[index]?.categoryName}
                    errorMessage={errors.sections?.[index]?.categoryName?.message}
                  />
                  <div className="flex-grow" />
                  <Button 
                    as="div" // 👈 MAGIC FIX: Render sebagai div, bukan button
                    role="button"
                    isIconOnly 
                    size="sm" 
                    color="danger" 
                    variant="light" 
                    onClick={(e) => {
                        e.stopPropagation(); // 👈 Cegah accordion ikut terbuka/tertutup saat ini diklik
                        removeSection(index);
                    }}
                  >
                    <Trash2 size={18}/>
                  </Button>
                </div>
              }
            >
              {/* BODY: Komponen List Soal yang Anda buat sebelumnya */}
              <CategorySectionBody 
                control={control}
                register={register}
                setValue={setValue}
                errors={errors}
                sectionIndex={index} 
                removeSection={() => removeSection(index)} 
              />
            </AccordionItem>
          ))}
        </Accordion>

        {fields.length === 0 && (
           <div className="text-center py-12 border-2 border-dashed rounded-xl text-gray-400">
             Belum ada kategori. Klik "Tambah Kategori" untuk memulai.
           </div>
        )}
      </div>

      {/* MODAL TAMBAH KATEGORI */}
      <CreateCategoryQuestionModal
        isOpen={modalProps?.isOpen}
        onOpenChange={modalProps?.onOpenChange}
        onAddCategory={handleAddCategoryFromModal}
      />
    </div>
  );
}