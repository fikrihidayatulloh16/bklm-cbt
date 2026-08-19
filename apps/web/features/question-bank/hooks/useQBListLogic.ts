// apps/web/features/question-bank/hooks/useQBListLogic.ts
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQuestionBankList } from "../api/question-bank.api";
import { showToast } from "@/components/ui/toast/toast-trigger";
import { QuestionBankListType } from "../types/question-bank.types";
import { QUERY_KEYS } from "@/lib/constants/query-keys.constant"; // 🔥 IMPORT INI

// 🚨 TAMBAHKAN userId SEBAGAI PARAMETER
export const useQBListLogic = (userId: string) => {
    const [searchValue, setSearchValue] = useState("");

    const { 
        data,       
        isLoading,  
        isError,    
        error,      
        refetch     
    } = useQuery({
        // 🔥 UBAH QUERY KEY MENJADI DINAMIS SESUAI WEBSOCKET
        queryKey: QUERY_KEYS.QUESTION_BANKS.LIST(userId), 
        
        // Fungsi API tetap TIDAK perlu parameter (karena pakai JWT)
        queryFn: getQuestionBankList,     
        
        staleTime: 60 * 1000,
        enabled: !!userId, // Proteksi tambahan
    });

    const qbList: QuestionBankListType[] = Array.isArray(data) ? data : [];

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

    // 🔥 Pindahkan console.log ke sini agar lebih jelas
    useEffect(() => {
        if (!isLoading) {
            console.log('🧐 Hasil akhir data di Hook:', data);
        }
    }, [data, isLoading]);

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