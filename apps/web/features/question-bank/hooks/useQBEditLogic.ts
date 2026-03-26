import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
// import { zodResolver } from "@hookform/resolvers/zod"; // Sesuaikan import schema Anda
import { getQBDetail } from '../api/question-bank.api';
import { groupQuestionsByCategory } from '../utils/question-transformer.util';
import { zodResolver } from "@hookform/resolvers/zod";
import { questionBankFormSchema, type QuestionBankFormValues } from "../schemas/question-bank.schema"; // Sesuaikan path
import { useDisclosure } from "@nextui-org/react";

export const useQBEditLogic = (bankId: string) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    // 4. Handle Tambah Kategori dari Modal
        const handleAddCategoryFromModal = (categoryName: string, questions: any[]) => {
            append({
                categoryName: categoryName,
                questions: questions
            });
            // Tutup modal bisa dihandle otomatis oleh onOpenChange di UI
        };

    // 1. FETCHING DATA (Kode Anda yang sudah mantap)
    const { 
        data: groupedDetail,
        isLoading: isFetching, 
        isError 
    } = useQuery({
        queryKey: ['question-bank-detail', bankId],
        queryFn: () => getQBDetail(bankId),
        select: (rawData) => ({
            id: rawData.id,
            title: rawData.title,
            description: rawData.description,
            groupedQuestions: groupQuestionsByCategory(rawData.questions) 
        }),
        enabled: !!bankId,
    });

    // 2. SETUP FORM (Mirip dengan useQBCreateLogic)
    const form = useForm<QuestionBankFormValues>({
        resolver: zodResolver(questionBankFormSchema), // Aktifkan jika schema sudah siap
        defaultValues: {
            title: "",
            description: "",
            sections: [] // Ini yang akan kita isi dengan data dari API
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "sections"
    });

    // 3. INJEKSI DATA KE FORM (Magic Part 2)
    useEffect(() => {
        // Jika data dari API sudah matang, masukkan ke form
        if (groupedDetail) {
            
            // Map data Accordion-ready ke format yang diminta oleh React Hook Form
            const formattedSections = groupedDetail.groupedQuestions.map(group => ({
                categoryName: group.category,
                questions: group.questions.map(q => ({
                    id: q.id, // 👈 SANGAT PENTING untuk proses Edit/Update di Backend
                    text: q.text,
                    type: q.type,
                    options: q.options.map(opt => ({
                        id: opt.id, // 👈 PENTING juga
                        label: opt.label,
                        score: opt.score
                    }))
                }))
            }));

            // Timpa defaultValues kosong dengan data dari backend
            form.reset({
                title: groupedDetail.title,
                description: groupedDetail.description,
                sections: formattedSections
            });
        }
    }, [groupedDetail, form]);

    const onSubmit = async (formData: QuestionBankFormValues) => {
        // 1. Bongkar (Flatten) sections kembali menjadi array of questions
        // Gunakan flatMap untuk melebur array 2 dimensi menjadi 1 dimensi
        const flatQuestions = formData.sections.flatMap(section => 
            section.questions.map(q => ({
                id: q.id ? q.id : undefined, // Jika soal baru, ini otomatis undefined (Aman)
                text: q.text,
                type: q.type,
                category: section.categoryName, // 👈 Pasang kembali nama kategorinya di sini
                options: q.options?.map(opt => ({
                    id: opt.id ? opt.id : undefined, // Jika opsi baru, ini undefined
                    label: opt.label,
                    score: opt.score
                })) || []
            }))
        );

        // 2. Susun Payload Akhir
        const payload = {
            title: formData.title,
            description: formData.description,
            questions: flatQuestions
        };

        

        // (Opsional) Console log dulu sebelum menembak API untuk memastikan bentuknya
        console.log("PAYLOAD SIAP KIRIM:", payload);

        try {
            // await updateQuestionBankAPI(bankId, payload);
            // showToast sukses...
            // router.push('/question-bank')
        } catch (error) {
            // handle error...
        }
    };

    return {
        form,
        fields,
        removeSection: remove,
        isFetching,
        isError,
        onSubmit,
        handleAddCategoryFromModal,
        // Modal Props
        modalProps: {
            isOpen,
            onOpen,
            onOpenChange
        },
    };
};