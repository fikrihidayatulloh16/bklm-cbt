import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDisclosure } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Imports (Sesuaikan path)
import { getListAssessment } from "../api/assessment.api";
import { getQuestionBankList } from "../../question-bank/api/question-bank.api";
import { createAssessmentFromBank } from "../api/assessment.api";
import { 
    AssessmentFormValues,
  createAssessmentFromBankPayload, 
  createAssessmentFromBankPayloadType 
} from "../schemas/assessment.schemas";
import { showToast } from "@/components/ui/toast/toast-trigger";
import { error } from "console";

export const useAssessmentMainLogic = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

    // 1. SETUP FORM (Zod + React Hook Form)
    // Hook ini wajib di top-level, jangan di dalam function submit
    const form = useForm<AssessmentFormValues>({
        // 👇 PERBAIKAN 1: Tambahkan 'as any' di sini
        // Ini membungkam error ketidakcocokan antara 'unknown' (Zod) vs 'string|number' (UI)
        resolver: zodResolver(createAssessmentFromBankPayload) as any,
        
        defaultValues: {
            title: "",
            description: "", 
            duration: 60, 
            question_bank_id: "",
            school_id: ""
        }
    });

    // 2. FETCH DATA (Parallel Fetching)
    const { 
        data, 
        isLoading, 
        isError,
        error
    } = useQuery({
        queryKey: ['assessments-page-data'], // Satu key untuk halaman ini
        queryFn: async () => {
            // Fetch List Assessment & List Bank Soal (untuk dropdown) sekaligus
            const [assessments, banks] = await Promise.all([
                getListAssessment(),
                getQuestionBankList()
            ]);
            
            return { assessments, banks };
        },
        staleTime: 5 * 60 * 1000, // Cache 5 menit
    });

    // 3. SAFETY CHECK (Data Processing)
    // "Apakah perlu safety check?" -> YA. Karena saat loading, data itu undefined.
    // Kita pastikan return array kosong agar UI tidak crash saat .map()
    const assessmentsList = Array.isArray(data?.assessments) ? data.assessments : [];
    const questionBankOptions = Array.isArray(data?.banks) ? data.banks : [];

    // 4. MUTATION (Create Logic)
    const mutation = useMutation({
        mutationFn: (payload: createAssessmentFromBankPayloadType) => createAssessmentFromBank(payload),
        onSuccess: async () => {
            showToast({ type: "success", message: "Berhasil", description: "Jadwal Ujian berhasil dibuat" });
            
            // Invalidate agar list ujian update otomatis
            await queryClient.invalidateQueries({ queryKey: ['assessments-page-data'] });
            
            // Reset form & Tutup modal
            form.reset();
            onClose();
        },
        onError: (error: any) => {
            console.error(error);
            showToast({ type: "danger", message: "Gagal", description: error.message || "Gagal membuat assessment" });
        }
    });

    // 5. HANDLER
    const onSubmit = (data: AssessmentFormValues) => {
        // Tidak perlu validasi manual "if (!title)..." karena Zod sudah menjaganya.
        // Tidak perlu parseInt manual, karena Zod (coerce) sudah mengubahnya jadi number.
        const payload = data as unknown as createAssessmentFromBankPayloadType;
        mutation.mutate(data as unknown as createAssessmentFromBankPayloadType);
    };

    const handleOpenCreateModal = () => {
        // Optional: Reset form saat buka modal baru
        form.reset();
        onOpen();
    };

    return {
        // Data untuk UI
        assessmentsList,
        questionBankOptions,
        isLoading,
        isError,
        
        // Form & Modal Props
        form,
        modalProps: {
            isOpen,
            onOpenChange,
            onClose
        },
        handleOpenCreateModal,
        
        // Actions
        handleSubmit: form.handleSubmit(onSubmit),
        isSubmitting: mutation.isPending // Gunakan state bawaan mutation
    };
};