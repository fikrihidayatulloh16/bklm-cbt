'use client';

import React from "react";
import { Spinner, Divider } from "@nextui-org/react";

// Components
import PublishModal from "@/features/assessments/components/publishModal";
import AssessmentHeader from "@/features/assessments/components/AssessmentIdHeader";
import AssessmentDetailTabs from "@/features/assessments/components/assessmentDetailTabs";
import AssessmentCardContent from "@/features/assessments/components/assessmentCardContent";

// Logic Hook
import { useAssessmentDetailLogic } from "@/features/assessments/hooks/useAssessmentDetailLogic"; 

export default function AssessmentDetailPage() {
  const {
    assessment,
    distinctClasses,
    submissions,
    questionAnalytics,
    isLoading,
    isPublishing,
    selectedKeys,
    setSelectedKeys,
    selectedClassName,
    modalProps,
    handlePublish,
    handleComplete,
    isError,   // 👈 Ambil ini
    error,
  } = useAssessmentDetailLogic();

// 1. PENGAMAN PERTAMA: Loading
  // Saat ini assessment masih undefined, tapi kita tampilkan Spinner
  if (isLoading) {
    return (
        <div className="flex h-[50vh] items-center justify-center">
            <Spinner size="lg" label="Memuat data..." />
        </div>
    );
  }

  // 2. PENGAMAN KEDUA: Error
  // Assessment undefined karena error
  if (isError) {
    console.error("🔥 DETAIL ERROR:", error); // Cek Console Browser (F12)
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-4 text-center">
        <div className="text-danger text-5xl">⚠️</div>
        <h2 className="text-xl font-bold text-danger">Gagal Memuat Data</h2>
        
        {/* Tampilkan pesan teknisnya */}
        <div className="bg-gray-100 p-4 rounded-lg text-left text-sm font-mono max-w-2xl overflow-auto border border-red-200">
           <p className="font-bold text-red-600 mb-2">Pesan Error:</p>
           {/* Menampilkan pesan error utama */}
           <p>{error instanceof Error ? error.message : "Unknown Error"}</p>
           
           <div className="divider my-2 border-t border-gray-300"></div>
           
           <p className="font-bold text-red-600 mb-2">Detail JSON:</p>
           {/* Menampilkan isi error lengkap (berguna utk Zod) */}
           <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      </div>
    );
  }

  // 3. PENGAMAN KETIGA: Data Kosong (Guard Clause)
  // Loading selesai, Error tidak ada, TAPI datanya null/undefined?
  // KITA STOP DISINI. Jangan lanjut ke bawah.
  if (!assessment) {
    return <div className="text-center py-10">Data tidak ditemukan</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Status */}
      <AssessmentHeader 
        id={assessment.id}
        title={assessment.title}
        description={assessment.description || ""}
        assessment_status={assessment.assessment_status}
        onPublishClick={modalProps.onOpen} 
      />

      {/* 2. Filter & Summary Cards */}
      <AssessmentCardContent
        submissionsLength={submissions.length}
        assessmentDuration={assessment.duration}
        // Pastikan konversi Date string ke Date object jika komponen butuh Date
        assessmentDeadLine={assessment.expired_at ? new Date(assessment.expired_at) : null}
        
        distinctClasses={distinctClasses}
        selectedClassName={selectedClassName || ''}
        
        // FIX: Passing setSelectedKeys dengan benar (Set<string>)
        // Pastikan komponen AssessmentCardContent menerima Dispatch<SetStateAction<Set<string>>>
        selectedKeys={selectedKeys} 
        setSelectedKeys={setSelectedKeys} 
        handleComplete={handleComplete}
      />
      
      {/* 3. Tabs (Submissions & Analytics) */}
      <AssessmentDetailTabs 
        assessmentId={assessment.id}
        submissions={submissions}
        question_analytics={questionAnalytics}
        assessment_status={assessment.assessment_status}
        selectedClassName={selectedClassName || ''}
      />

      {/* 4. Modal Publish */}
      <PublishModal 
        isOpen={modalProps.isOpen}
        onOpenChange={modalProps.onOpenChange}
        onConfirm={handlePublish}
        isLoading={isPublishing}
      />

    </div>
  );
}