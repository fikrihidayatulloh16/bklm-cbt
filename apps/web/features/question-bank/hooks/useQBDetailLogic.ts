

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDisclosure } from '@nextui-org/react';
import { showToast } from '@/components/ui/toast/toast-trigger'; // Sesuaikan import
import { getQBDetail, removeOneQB } from '../api/question-bank.api'; // Sesuaikan import
import { QuestionBankDetailType } from '../types/question-bank.types'; // Sesuaikan import

export const useQBDetailLogic = () => {
    // 1. Hooks & Params
    const params = useParams();
    const router = useRouter();
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

    // 2. State Management
    const [qbDetail, setQBDetail] = useState<QuestionBankDetailType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State Delete
    const [selectedIdToDelete, setSelectedIdToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // 3. Fetching Function (Pola yang Anda inginkan) ✅
    const fetchData = useCallback(async () => {
        // Guard Clause: Kalau tidak ada ID, stop.
        if (!params.id) return;

        try {
            setIsLoading(true);
            setError(null);

            // Fetch API
            const result = await getQBDetail(params.id as string);
            
            // Validasi sederhana (jika backend return object)
            if (result) {
                setQBDetail(result);
            } else {
                throw new Error("Data kosong");
            }

        } catch (err) {
            console.error("Fetch Error:", err);
            setError("Gagal mengambil data");
            showToast({ type: "danger", message: "Gagal", description: "Data tidak ditemukan!" });
            
            // Redirect jika data tidak ketemu (UX yang bagus)
            router.push('/question-bank');
        } finally {
            setIsLoading(false);
        }
    }, [params.id, router]); // Dependency: Akan dibuat ulang hanya jika ID berubah

    // 4. Effect (Trigger Fetch saat mount atau ID berubah)
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 5. Delete Logic (Tetap sama)
    const handleDeleteClick = (id: string) => {
        setSelectedIdToDelete(id);
        onOpen();
    };

    const confirmDelete = async () => {
        if (!selectedIdToDelete) return;
        setIsDeleting(true);
        try {
            await removeOneQB(selectedIdToDelete);
            showToast({ type: "success", message: "Berhasil", description: 'Data berhasil dihapus' });
            router.push('/question-bank');
            onClose();
        } catch (error) {
            showToast({ type: "danger", message: "Gagal menghapus data" });
        } finally {
            setIsDeleting(false);
        }
    };

    // 6. Return Values
    return {
        // Data State
        qbDetail,
        isLoading,
        error,
        
        // Actions
        refetch: fetchData, // <-- INI KELEBIHANNYA. Bisa dipanggil manual nanti.
        
        // Delete Modal Props
        isOpen,
        onOpenChange,
        handleDeleteClick,
        confirmDelete,
        isDeleting,
    };
};