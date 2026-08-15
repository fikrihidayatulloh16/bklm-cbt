'use client';

// apps/web/features/dashboard/hooks/useDashboardLogic.ts
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS, QUERY_TTL } from '@/lib/constants/query-keys.constant';
import { getAssessmentList, getQuestionBankList, getAssessmentDashboard } from "../api/dashboard.api";
import { showToast } from "@/components/ui/toast/toast-trigger";

export const useDashboardLogic = (userId: string) => {

    const safeUserId = userId || "user-ans-1";

    const { 
        data,
        isLoading,  
        isError,    
        error,      
        refetch     
    } = useQuery({
        // 🔥 Gunakan satu key utama ini. Mapper kita harus merujuk ke kunci ini juga.
        queryKey: QUERY_KEYS.DASHBOARD.SUMMARY(safeUserId), 
        
        queryFn: async () => {
            const [assessments, questionBanks, stats] = await Promise.all([
                getAssessmentList(), 
                getQuestionBankList(), 
                getAssessmentDashboard()
            ]);

            return {
                assessments, 
                questionBanks, 
                stats
            };
        },    
        staleTime: QUERY_TTL.DEFAULT, // 5 menit
        enabled: !!userId, // Proteksi: jangan fetch jika userId kosong
    });

    useEffect(() => {
        if (isError) {
            console.error("Dashboard Fetch Error:", error);
            showToast({
                type: 'danger', 
                message: 'Gagal', 
                description: 'Gagal mengambil data dashboard'
            });
        }
    }, [isError, error]);

    return {
        isLoading,
        error,
        // Pastikan membacanya dari "data.stats", bukan "statsData.stats"
        dashboardStats: data?.stats || null,
        lastAssessments: data?.assessments || [],
        lastQuestionBanks: data?.questionBanks || [],
        refetch
    };
};