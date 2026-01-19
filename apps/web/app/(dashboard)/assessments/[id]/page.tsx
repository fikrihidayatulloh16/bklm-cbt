'use client';

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDisclosure, Spinner, Divider } from "@nextui-org/react"; // useDisclosure untuk modal
import api from "@/lib/api";

// Import Komponen Pecahan Tadi
import PublishModal from "@/components/fragments/assessment-id/publishModal";
import AssessmentHeader from "@/components/fragments/assessment-id/assessment-id-header";
import AssessmentDetailTabs, { Submission } from "@/components/fragments/assessment-id/assessmentDetailTabs";
import AssessmentCardContent from "@/components/fragments/assessment-id/assessmentCardContent";
import AssessmentAnalytics from "@/components/fragments/assessment-id/AssessmentAnalytics";

// ... (Interface Submission dll tetap sama, boleh dipisah ke file types.ts kalau mau lebih rapi) ...
interface AssessmentDetail {
  id: string;
  title: string;
  description: string;
  assessment_status: string; // pastikan backend kirim 'status' atau 'assessment_status'
  created_at: Date;
  expired_at: Date;
  duration: number;
  submissions: any[];
}

export default function AssessmentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  // State Data
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [deadLine, setDeadLine] = useState<Date | null>(null);

  // Hook Modal bawaan NextUI (Sangat praktis!)
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  // 1. Fetch Data
  const fetchDetail = async () => {
    try {
      const response = await api.get(`/assessments/${id}`);
      setAssessment(response.data);
      setDeadLine(response.data)

      // Backend mengembalikan Object { submissions: [...] }, bukan langsung Array [...]
        const resSubs = await api.get(`/assessments/${id}/results`);

      // Kita ambil array yang ada DI DALAM object tersebut
      const subsArray = resSubs.data?.submissions || []; 
      setSubmissions(subsArray);

    } catch (error) {
      console.error("Gagal ambil detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  // 2. Logic Publish
  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      // Panggil API Backend (Pastikan route-nya benar)
      // PATCH /assessments/:id/publish
      await api.patch(`/assessments/${id}/publish`); 
      
      // Refresh data agar status berubah jadi PUBLISHED di layar
      
      
      fetchDetail(); 
      console.log('sudah direfresh');
      
      onClose(); // Tutup modal
    } catch (error) {
      alert("Gagal mempublish ujian!");
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><Spinner size="lg" label="Memuat data..." /></div>;
  if (!assessment) return <div className="text-center py-10">Data tidak ditemukan</div>;

  console.log(assessment.assessment_status);
  

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Table Content */}
      <AssessmentHeader 
        id={assessment.id}
        title={assessment.title}
        description={assessment.description}
        assessment_status={assessment.assessment_status} // Sesuaikan field backend (status / assessment_status)
        onPublishClick={onOpen}    // Trigger buka modal
      />

      <Divider className="my-2"/>
      <AssessmentCardContent
        submissionsLength={submissions.length}
        assessmentDuration={assessment.duration}
        assessmentDeadLine={assessment.expired_at}
      />
      
      {/* table cotnent COMPONENT (Bersih kan?) */}
      <AssessmentDetailTabs 
        assessmentId={id}
        submissions={submissions}
      />

        {/* PANGGIL KOMPONEN ANALYTICS DI SINI */}
        <AssessmentAnalytics assessmentId={id} />


      {/* ISI KONTEN LAIN (Statistik, Tabel, dll - Kode lama Anda) */}
      {/* Card Content */}

      {/* MODAL COMPONENT (Tersembunyi sampai dipanggil) */}
      <PublishModal 
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onConfirm={handlePublish}
        isLoading={isPublishing}
      />

    </div>
  );
}