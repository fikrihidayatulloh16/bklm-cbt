import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDisclosure } from "@nextui-org/react";
import { showToast } from "@/components/ui/toast/toast-trigger";

// Import Schema & Utils
import { questionBankFormSchema, QuestionBankFormValues } from "@/lib/schemas/question-bank.schema";
import { transformFormToPayload } from "@/lib/utils/form-transformers";
import { createQuestionBank } from "../api/question-bank.api";

export const useQBCreateLogic = () => {
    const router = useRouter();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // 3. Handle Submit
    const onSubmit = async (data: QuestionBankFormValues) => {
        setIsSubmitting(true);
        try {
            // Transform data form UI ke format Backend
            const payload = transformFormToPayload(data);
            
            // Panggil API
            await createQuestionBank(payload);

            showToast({ type: "success", message: "Berhasil", description: "Bank soal berhasil disimpan!" });
            router.push('/question-bank');
            router.refresh();
        } catch (error) {
            console.error(error);
            showToast({ type: "danger", message: "Gagal", description: "Gagal menyimpan bank soal." });
        } finally {
            setIsSubmitting(false);
        }
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
        isSubmitting
    };
};