

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDisclosure } from '@nextui-org/react';
import { showToast } from '@/components/ui/toast/toast-trigger'; // Sesuaikan import
import { getQBDetail, removeOneQB } from '../api/question-bank.api'; // Sesuaikan import
import { QuestionBankDetailType } from '../types/question-bank.types'; // Sesuaikan import
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useQBDetailLogic = () => {
    // 1. Hooks & Params
    const params = useParams();
    const router = useRouter();
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const queryClient = useQueryClient(); 
    const id = params.id as string;

    // State Delete
    const [selectedIdToDelete, setSelectedIdToDelete] = useState<string | null>(null);

    const {
        data,
        isError,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['question-bank-detail', id], // ID Unik untuk cache ini
        queryFn: () => getQBDetail(id),     // Fungsi API yang dipanggil
        staleTime: 1000 * 60 * 5,         // cache selama 5 menit
    });


    // 4. Effect (Trigger Fetch saat mount atau ID berubah)
    useEffect(() => {
        if (error) {
            showToast({type: 'danger', message: 'Gagal', description: 'Gagal Memuata Detail Bank Soal'})
        }
    }, [isError, error]);

    const confirmDelete = useMutation ({
        mutationFn: () => removeOneQB(id),
        onSuccess: async () => {
            showToast({ type: 'success', message: 'Berhasil', description: 'Bank soal dihapus' });
            await queryClient.invalidateQueries({queryKey: ['question-bank-list']})
            router.push('/question-bank') // kembali ke list question bank
        },
        onError: () => {showToast({type: 'danger', message: 'Gagal', description: 'Gagal menghapus bank soal'})}
    })

    // 5. Delete Logic (Tetap sama)
    const handleDeleteClick = (id: string) => {
        setSelectedIdToDelete(id);
        onOpen();
    };

    const onConfirmDelete = () => {
        confirmDelete.mutate();
    };

    // 6. Return Values
    return {
        // Data State
        qbDetail: data as QuestionBankDetailType | null,
        isLoading,
        isError,
        refetch,
        
        // Delete Modal Props
        isOpen,
        onOpenChange,
        handleDeleteClick,
        onConfirmDelete,
        isDeleting: confirmDelete.isPending,
    };
};