import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDisclosure } from "@nextui-org/react";
import { showToast } from "@/components/ui/toast/toast-trigger";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Import Schema & Utils
import { questionBankFormSchema, QuestionBankFormValues } from "@/lib/schemas/question-bank.schema";
import { transformFormToPayload } from "@/lib/utils/form-transformers";
import { createQuestionBank } from "../api/question-bank.api";
import { CreateQuestionBankPayload } from "../types/question-bank.types";

export const useQBCreateLogic = () => {
    const router = useRouter();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const queryClient = useQueryClient()

    // 1. Setup Form
    const form = useForm<QuestionBankFormValues>({
        resolver: zodResolver(questionBankFormSchema),
        defaultValues: {
            title: "",
            description: "",
            sections: []
        }
    });

    // 2. Setup Field Array (Untuk Kategori)
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "sections"
    });

    const mutation = useMutation ({
        mutationFn: (payload: CreateQuestionBankPayload) => createQuestionBank(payload),
        onSuccess: async () => {
            showToast({type: "success", message: "Berhasil", description: "Bank soal berhasil disimpan!"})
            queryClient.invalidateQueries({queryKey: ['question-bank-list', 'dashboard-data']})
            router.push('/question-bank')
        },
        onError: () => {showToast({type: "danger", message: "Gagal", description: "Bank soal gagal disimpan!"})}
    })

    // 3. Handle Submit
    const onSubmit = async (formData: QuestionBankFormValues) => {
        const payload = transformFormToPayload(formData)
        mutation.mutate(payload)
    };

    // 4. Handle Tambah Kategori dari Modal
    const handleAddCategoryFromModal = (categoryName: string, questions: any[]) => {
        append({
            categoryName: categoryName,
            questions: questions
        });
        // Tutup modal bisa dihandle otomatis oleh onOpenChange di UI
    };

    return {
        // Form Props
        form,
        fields,
        removeSection: remove,
        
        // Actions
        handleSubmit: form.handleSubmit(onSubmit),
        handleAddCategoryFromModal,
        
        // Modal Props
        modalProps: {
            isOpen,
            onOpen,
            onOpenChange
        },

        // State
        isSubmitting: mutation.isPending,
    };
};