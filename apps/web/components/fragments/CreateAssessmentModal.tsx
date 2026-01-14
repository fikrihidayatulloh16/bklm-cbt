// 'use client';

// import { useState } from 'react';
// import { 
//   Modal, 
//   ModalContent, 
//   ModalHeader, 
//   ModalBody, 
//   ModalFooter, 
//   Button, 
//   Input, 
//   Textarea 
// } from "@nextui-org/react";
// import { useRouter } from 'next/navigation';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import api from '@/lib/api'; 

// // --- PERBAIKAN DI SINI (SCHEMA) ---
// const assessmentSchema = z.object({
//   title: z.string().min(5, "Judul minimal 5 karakter").max(100),
//   description: z.string().optional(),
//   // Gunakan z.coerce.number() agar otomatis convert string input ke number
//   durationMinutes: z.coerce
//     .number({ invalid_type_error: "Durasi harus berupa angka" })
//     .min(1, "Durasi minimal 1 menit")
//     .max(180, "Maksimal 3 jam"),
// });

// // Infer tipe data
// type AssessmentFormValues = z.infer<typeof assessmentSchema>;

// interface CreateAssessmentModalProps {
//   isOpen: boolean;
//   onOpenChange: () => void;
// }

// export default function CreateAssessmentModal({ isOpen, onOpenChange }: CreateAssessmentModalProps) {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset
//   } = useForm<AssessmentFormValues>({
//     resolver: zodResolver(assessmentSchema),
//     defaultValues: {
//       title: "",
//       description: "",
//       durationMinutes: 60, // Default number
//     }
//   });

//   const onSubmit = async (data: AssessmentFormValues) => {
//     setIsLoading(true);
//     try {
//       // Data sudah otomatis dikonversi jadi number oleh Zod
//       const response = await api.post('/assessments', data);
      
//       console.log('Success:', response.data);
//       reset(); 
//       onOpenChange(); 
//       router.refresh(); 
      
//     } catch (error) {
//       console.error('Failed to create:', error);
//       alert("Gagal membuat assessment."); 
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Modal 
//       isOpen={isOpen} 
//       onOpenChange={onOpenChange} 
//       placement="top-center"
//       size="full" 
//       className="sm:max-w-md sm:h-auto"
//       scrollBehavior="inside"
//     >
//       <ModalContent>
//         {(onClose) => (
//           <form onSubmit={handleSubmit(onSubmit)}>
//             <ModalHeader className="flex flex-col gap-1">Buat Ujian Baru</ModalHeader>
            
//             <ModalBody>
//               <Input
//                 {...register("title")}
//                 autoFocus
//                 label="Judul Ujian"
//                 placeholder="Contoh: UAS Matematika Kelas 10"
//                 variant="bordered"
//                 isInvalid={!!errors.title}
//                 errorMessage={errors.title?.message}
//               />
              
//               <Textarea
//                 {...register("description")}
//                 label="Deskripsi"
//                 placeholder="Deskripsi singkat..."
//                 variant="bordered"
//                 minRows={3}
//               />
              
//               <Input
//                 {...register("durationMinutes")}
//                 label="Durasi (Menit)"
//                 type="number" // Input HTML tetap type="number"
//                 variant="bordered"
//                 isInvalid={!!errors.durationMinutes}
//                 errorMessage={errors.durationMinutes?.message}
//               />
//             </ModalBody>

//             <ModalFooter>
//               <Button color="danger" variant="flat" onPress={onClose} isDisabled={isLoading}>
//                 Batal
//               </Button>
//               <Button color="primary" type="submit" isLoading={isLoading}>
//                 Simpan
//               </Button>
//             </ModalFooter>
//           </form>
//         )}
//       </ModalContent>
//     </Modal>
//   );
// }