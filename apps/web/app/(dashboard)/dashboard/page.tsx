'use client';

import { Button } from "@nextui-org/react";
import { PlayCircle, Plus } from "lucide-react";

import Cookies from 'js-cookie';
import { useDashboardLogic } from "@/features/dashboard/hooks/useDashboardLogic";
import { AssessmentList } from "@/features/dashboard/components/AssessmentHorizon";
import { QuestionBankList } from "@/features/dashboard/components/QuestionBankHorizon";
import { DashboardStatsGrid } from "@/features/dashboard/components/DashboardStats";
import { useMemo } from "react";
import { jwtDecode } from "jwt-decode";

export default function DashboardPage() {

  // 1. Ambil dan bongkar token di Client Side
  const userId = useMemo(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        return jwtDecode<{ sub: string }>(token).sub;
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  }, []);

  // if (!userId) return <div>Sesi tidak valid, silakan login kembali.</div>;

  // Memanggil Hook Logic
  const { isLoading, error, dashboardStats, lastAssessments, lastQuestionBanks, } = useDashboardLogic(userId!)

  // Handle State Loading/Error
  if (isLoading) return <div className="p-10 text-center">Memuat data...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error.message}</div>;

  // 3. Render UI (Otot)
  return (
    <div className="space-y-8 pb-8">
      
      {/* 1. HEADER SECTION 
          UX: Sapaan personal membuat dashboard terasa "hidup".
          Di HP: Stack ke bawah. Di Laptop: Kiri Kanan.
      */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Halo, Selamat Datang! 👋</h1>
          <p className="text-default-500 text-sm">Berikut ringkasan aktivitas Anda Terakhir.</p>
        </div>
        
        {/* <div className="flex gap-3"> */}
          {/* Action Button Utama ditaruh disini agar mudah diakses */}
          {/* <Button variant="flat" color="primary" startContent={<Plus size={18}/>}> */}
            {/* Bank Soal Baru */}
          {/* </Button> */}
          {/* <Button color="primary" startContent={<PlayCircle size={18}/>}> */}
            {/* Jadwalkan Ujian */}
          {/* </Button> */}
        {/* </div> */}
      </div>


      {/* Kirim data stats ke Component StatsGrid */}
      {dashboardStats && <DashboardStatsGrid data={dashboardStats} />}
      
      {/* Kirim data assessments ke Component List */}
      <AssessmentList data={lastAssessments} />
      
      {/* Kirim data questionBanks ke Component List (Nanti diaktifkan) */}
      <QuestionBankList data={lastQuestionBanks} />

    </div>
  );
}