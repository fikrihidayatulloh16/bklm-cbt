'use client';

import { useState, useEffect, useCallback } from "react";
import { DashboardStats, LastAssessment, LastQuestionBank } from "../types/dashboard.types";
import { getAssessmentList, getQuestionBankList, getAssessmentDashboard } from "../api/dashboard.api";
import { showToast } from "@/components/ui/toast/toast-trigger";

export const useDashboardLogic = () => {
    // State Management
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State data
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [lastAssessments, setLastAssessment] = useState<LastAssessment[]>([]);
    const [lastQuestionBanks, setLastQuestionBank] = useState<LastQuestionBank[]>([])

    // Fetching Function
    const fetchData = useCallback( async () => {
        try {
            setIsLoading(true);
            setError(null)

            const [lastAssessmentData, lastQBData, DashboardStats] = await Promise.all([
                getAssessmentList(),
                getQuestionBankList(),
                getAssessmentDashboard()
            ]);

            //Set State From Fetching
            setLastAssessment(lastAssessmentData);
            setLastQuestionBank(lastQBData)

            setDashboardStats(DashboardStats)
        } catch (err: any) {
            showToast({type: 'danger', message: 'Gagal', description: 'Gagal Memuat Dashboard'})
        } finally {
            setIsLoading(false)
        }
    }, []);

    // Effect
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        isLoading,
        error,
        dashboardStats,
        lastAssessments,
        lastQuestionBanks,
        refetch: fetchData
    }
}