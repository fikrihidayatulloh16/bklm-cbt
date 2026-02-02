// "use client";

// import { useEffect } from "react";
// import { useForm, useFieldArray } from "react-hook-form";
// import { useRouter } from "next/navigation";
// import { showToast } from "@/components/ui/toast/toast-trigger";
// import { Button, Input, Accordion, AccordionItem } from "@nextui-org/react";
// import { Save, Layers, Trash2, Plus } from "lucide-react";
// import CategorySectionBody from "@/components/fragments/question-bank/CategorySection";

// // Import komponen UI yang sudah ada (Kita reuse tampilannya)
// import QuestionItem  from "@/components/fragments/question-bank/QuestionItem"; 
// // Import transformer (Code ada di jawaban sebelumnya)
// import { transformBackendToForm, transformFormToBackend } from "../../lib/utils/form-transformers";

// interface EditFormProps {
//   id: string; // ID Question Bank
// }

// interface Section {
//   id?: string;
//   title: string;
//   questions?: any[];
// }

// interface QuestionBankFormData {
//   title: string;
//   description: string;
//   sections: Section[];
// }

// export default function EditQuestionBankForm({ id }: EditFormProps) {
//   const router = useRouter();

//   // 1. Setup Form dengan struktur 'sections' (sama kayak Create tapi logic beda)
//   const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<QuestionBankFormData>({
//     defaultValues: {
//       title: "",
//       description: "",
//       sections: [] // Nanti diisi oleh useEffect
//     }
//   });

//   // Array Field untuk Accordion Kategori
//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "sections"
//   });

//   // 2. Fetch Data & Isi Form (Auto-Fill)
//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const res = await fetch(`http://localhost:3000/api/question-bank/${id}`);
//         const backendData = await res.json();
        
//         // ✨ MAGIC HAPPENS HERE: Ubah data backend jadi struktur Form
//         const formData = transformBackendToForm(backendData);
        
//         // Masukkan ke form
//         reset(formData); 
//       } catch (e) {
//         showToast({ type: "danger", message: "Gagal mengambil data instrumen" });
//       }
//     };
//     loadData();
//   }, [id, reset]);

//   // 3. Handle Update
//   const onSubmit = async (data: any) => {
//     try {
//       // Ubah balik: Form (Sections) -> Backend (Flat Questions)
//       const payload = transformFormToBackend(data);

//       const res = await fetch(`http://localhost:3000/api/question-bank/${id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) throw new Error("Gagal update");

//       showToast({ type: "success", message: "Berhasil diperbarui!" });
//       router.push("/dashboard/question-bank");
//       router.refresh();
//     } catch (e) {
//       showToast({ type: "danger", message: "Gagal menyimpan perubahan" });
//     }
//   };

//   // --- RENDER UI (Copy Paste Layout dari Create, tapi sesuaikan sedikit) ---
//   return (
//     <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
//        {/* HEADER */}
//        <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">Edit Instrumen</h1>
//         <Button 
//           color="warning" // Pembeda visual bahwa ini Edit
//           startContent={<Save size={18}/>}
//           isLoading={isSubmitting}
//           onPress={() => handleSubmit(onSubmit)()}
//         >
//           Update Perubahan
//         </Button>
//       </div>

//       {/* METADATA FORM */}
//       <div className="bg-white p-6 rounded-xl border border-default-200 shadow-sm space-y-4">
//           <Input {...register("title")} label="Judul" variant="bordered" />
//           <Input {...register("description")} label="Deskripsi" variant="bordered" />
//       </div>

//       {/* AREA ACCORDION (Copy Logic Map Fields dari Create) */}
//       <div className="space-y-4">
//         {/* ... Copy Paste bagian Accordion & Fields.map dari Create ... */}
//         {/* Pastikan memanggil <QuestionItem /> dengan props yang benar */}
        
//         <Accordion variant="splitted" selectionMode="multiple">
//           {fields.map((sectionField, index) => (
//             <AccordionItem key={sectionField.id} title={/* ... Input Judul Kategori ... */}>
//                {/* Di sini looping questions.
//                    PENTING: Gunakan QuestionItem yang sudah kita tambah hidden ID tadi 
//                */}
//                <CategorySectionBody
//                   control={control} 
//                   index={index} 
//                   register={register} 
//                   // ... props lain
//                />
//             </AccordionItem>
//           ))}
//         </Accordion>
//       </div>
//     </div>
//   );
// }