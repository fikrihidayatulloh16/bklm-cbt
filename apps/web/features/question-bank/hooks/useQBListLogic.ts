import { error } from "console";
import { useCallback, useEffect, useState } from "react";
import { QuestionBankListType } from "../types/question-bank.types";
import { getQuestionBankList } from "../api/question-bank.api";
import { showToast } from "@/components/ui/toast/toast-trigger";

export const useQBListLogic = () => {
    // Page State
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<String | null>(null)
    const [searchValue, setSearchValue] = useState("");

    // Data State
    const [qbList, setQBList] = useState<QuestionBankListType[]>([])

    const fetchData = useCallback( async () => {
        try {
            setIsLoading(true)
            setError(null)

            const result = await getQuestionBankList(); //mengeksekusi fetch api
            if (Array.isArray(result)) {
                setQBList(result);
            } else {
                // Handle jika response bukan array (misal single object atau error object)
                console.error("API response is not an array:", result);
                setQBList([]); 
            }
        } catch (err: any) {
            showToast({type: 'danger', message: 'Gagal', description: 'Gagal mengambil list bank soal'})
        } finally {
            setIsLoading(false)
        }
    }, [])

    //Effect
    useEffect(() => {
        fetchData()
    }, [fetchData])

    let filteredQuestionBank = null

    if (qbList != null) {
        // 4. Filter Logic
        filteredQuestionBank = qbList.filter((item) =>
            item.title.toLowerCase().includes(searchValue.toLowerCase())
        );
    } else { filteredQuestionBank = qbList }
    

    return {
        isLoading,
        searchValue,
        setSearchValue,
        filteredQuestionBank,
        refetch: fetchData
    }
}