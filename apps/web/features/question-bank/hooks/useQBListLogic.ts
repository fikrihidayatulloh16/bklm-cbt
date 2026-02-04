import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query"; // ✅ Import Utama
import { getQuestionBankList } from "../api/question-bank.api";
import { showToast } from "@/components/ui/toast/toast-trigger";
import { QuestionBankListType } from "../types/question-bank.types";

export const useQBListLogic = () => {
    // 1. State hanya untuk Search (Client Side)
    const [searchValue, setSearchValue] = useState("");

    // 2. Ganti useEffect manual dengan useQuery
    const { 
        data,       // Data hasil fetch (otomatis disimpan disini)
        isLoading,  // Status loading otomatis
        isError,    // Status error otomatis
        error,      // Detail error
        refetch     // Fungsi untuk refresh data manual
    } = useQuery({
        queryKey: ['question-bank-list'], // ID Unik untuk cache ini
        queryFn: getQuestionBankList,     // Fungsi API yang dipanggil
        staleTime: 60 * 1000,          // (Opsional) Data dianggap segar selama 1 menit
    });

    // 3. Safety Check: Pastikan data selalu Array (cegah crash jika API error/null)
    const qbList: QuestionBankListType[] = Array.isArray(data) ? data : [];

    // 4. Handle Error Notification (Side Effect)
    // Karena useQuery v5 tidak punya callback onError, kita pakai useEffect simple ini
    useEffect(() => {
        if (isError) {
            console.error(error);
            showToast({
                type: 'danger', 
                message: 'Gagal', 
                description: 'Gagal mengambil list bank soal'
            });
        }
    }, [isError, error]);

    // 5. Filter Logic (Tetap sama)
    const filteredQuestionBank = qbList.filter((item) =>
        item.title?.toLowerCase().includes(searchValue.toLowerCase())
    );

    return {
        isLoading,
        searchValue,
        setSearchValue,
        filteredQuestionBank,
        refetch
    };
}