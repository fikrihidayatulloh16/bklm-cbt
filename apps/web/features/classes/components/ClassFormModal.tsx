// apps/web/features/classes/components/ClassFormModal.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { classSchema, ClassFormValues } from "../schemas/class.schemas";
import { useCreateClassMutation } from "../queries/class.queries"; // Tambahkan useUpdateClassMutation nanti

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  existingData: ClassFormValues | null;
}

export default function ClassFormModal({ isOpen, onClose, schoolId, existingData }: ClassFormModalProps) {
  const isEditing = !!existingData;
  const createMutation = useCreateClassMutation(schoolId);

  // Integrasi Zod dengan React Hook Form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      schoolId: schoolId,
      level: "",
      name: "",
    }
  });

  // Reset form ketika modal dibuka/ditutup atau mode berubah
  useEffect(() => {
    if (isOpen) {
      if (existingData) {
        reset(existingData); // Mode Edit
      } else {
        reset({ schoolId, level: "", name: "" }); // Mode Tambah
      }
    }
  }, [isOpen, existingData, reset, schoolId]);

  const onSubmit = (data: ClassFormValues) => {
    console.log('schoolid: ', schoolId);
    
    if (isEditing) {
      // Panggil fungsi update (Nanti Anda buat di class.queries.ts)
      console.log("Update:", data);
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          onClose(); // Tutup modal hanya jika berhasil ke backend
        }
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-900">{isEditing ? "Edit Kelas" : "Tambah Kelas Baru"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          {/* INPUT LEVEL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level / Tingkat</label>
            <input 
              {...register("level")}
              placeholder="Misal: VII, X, atau XII"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.level && <p className="text-red-500 text-xs mt-1">{errors.level.message}</p>}
          </div>

          {/* INPUT NAMA KELAS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelas / Rombel</label>
            <input 
              {...register("name")}
              placeholder="Misal: RPL 1, MIPA 3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* ACTIONS */}
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:opacity-50"
            >
              {createMutation.isPending ? "Menyimpan..." : (isEditing ? "Simpan Perubahan" : "Buat Kelas")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}