import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStudentAnswerDetail } from "../api/student-answer-details.api"; // Sesuaikan path
import { showToast } from "@/components/ui/toast/toast-trigger";

// 1. Hook SEKARANG menerima 2 parameter ID
export const useStudentAnswerDetailLogic = (assessmentId: string | null, submissionId: string | null) => {
    
    const { 
        data: studentDetail, // Ganti alias agar lebih jelas dibaca di UI
        isLoading, 
        isError, 
        error, 
        refetch 
    } = useQuery({
        // 2. Query Key Dinamis: Cache akan terpisah untuk setiap siswa & ujian yang berbeda
        queryKey: ['student-answer-detail', assessmentId, submissionId], 
        
        // 3. Arrow function untuk passing parameter
        queryFn: () => getStudentAnswerDetail(assessmentId!, submissionId!), 
        
        // 4. Mencegah fetch berjalan otomatis jika ID belum tersedia (misal saat Modal baru mau render)
        enabled: !!assessmentId && !!submissionId, 
        
        staleTime: 5 * 60 * 1000, 
    });

    useEffect(() => {
        if (isError) {
            console.error(error);
            showToast({
                type: 'danger', 
                message: 'Gagal', 
                description: 'Gagal mengambil detail jawaban siswa.' // Pesan disesuaikan
            });
        }
    }, [isError, error]);

    return {
        studentDetail, // 👈 PENTING: Jangan lupa return datanya!
        isLoading,
        isError,
        refetch
    };
}