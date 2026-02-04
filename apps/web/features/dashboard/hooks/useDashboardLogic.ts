'use client';

import { useState, useEffect, useCallback } from "react";
import { DashboardStats, LastAssessment, LastQuestionBank } from "../types/dashboard.types";
import { getAssessmentList, getQuestionBankList, getAssessmentDashboard } from "../api/dashboard.api";
import { QuestionBankListType } from "@/features/question-bank/types/question-bank.types"; 
import { showToast } from "@/components/ui/toast/toast-trigger";
import { useQuery } from "@tanstack/react-query"; // ✅ Import Utama

export const useDashboardLogic = () => {

// 2. Ganti useEffect manual dengan useQuery
    const { 
        data,
        isLoading,  // Status loading otomatis
        isError,    // Status error otomatis
        error,      // Detail error
        refetch     // Fungsi untuk refresh data manual
    } = useQuery({
        queryKey: ['dashboard-data'], // ID Unik untuk cache ini
        queryFn: async () => {
            const [assessments, questionBanks, stats] = await Promise.all([
                getAssessmentList(), getQuestionBankList(), getAssessmentDashboard()
            ]);

            return {
                assessments, questionBanks, stats
            }
        },    // Fungsi API yang dipanggil
        staleTime: 5 * 60 * 1000,          // 5 menit
    });

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

    return {
        isLoading,
        error,
        dashboardStats: data?.stats || null,
        lastAssessments: data?.assessments || [],
        lastQuestionBanks: data?.questionBanks || [],
        refetch
    }
}