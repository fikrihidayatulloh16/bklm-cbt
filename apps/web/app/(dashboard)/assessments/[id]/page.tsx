'use client';

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDisclosure, Spinner, Divider } from "@nextui-org/react"; // useDisclosure untuk modal
import api from "@/lib/api";

// Import Komponen Pecahan Tadi
import PublishModal from "@/components/fragments/assessment-id/publishModal";
import AssessmentHeader from "@/components/fragments/assessment-id/assessment-id-header";
import { Submission } from "@/components/fragments/assessment-id/table-content/tabStudent";
import { QuestionsAnalytic } from "@/components/fragments/assessment-id/table-content/tabQuestion";
import AssessmentDetailTabs from "@/components/fragments/assessment-id/assessmentDetailTabs";
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
  const [questionAnalytics, setQuestionAnalytics] = useState<QuestionsAnalytic[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [deadLine, setDeadLine] = useState<Date | null>(null);
  const [selectedKeys, setSelectedKeys] = useState(new Set(["all"]));
  const [distinctClasses, setDistinctClasses] = useState<string[]>([]);

  // Hook Modal bawaan NextUI (Sangat praktis!)
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

   // 2. HELPER: Mengubah Selection Set menjadi String untuk API
  const selectedClassName = useMemo(() => {
    // Ambil value pertama dari Set
    const selected = Array.from(selectedKeys)[0] as string;
    return selected === "all" ? undefined : selected;
  }, [selectedKeys]);

  // 3. FETCH DATA KELAS (Hanya sekali saat mount)
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get(`/assessments/${id}/distinct-class`);
        setDistinctClasses(res.data);
      } catch (err) {
        console.error("Gagal ambil daftar kelas", err);
      }
    };
    fetchClasses();
  }, [id]);

  // 1. Fetch Data
  useEffect(() => {
   const fetchDetail = async () => {
    //Mengaktifkan loading
    setIsLoading(true);
    
    try {
      const response = await api.get(`/assessments/${id}`);
      setAssessment(response.data);
      setDeadLine(response.data)

      // Tentukan URL: Apakah pakai filter atau tidak?
      let url = `/assessments/${id}/results`;
      let questAurl = `/assessments/${id}/analytics`;
      
      // Jika ada filter kelas, tambahkan query param
      if (selectedClassName) {
        url += `?class_name=${encodeURIComponent(selectedClassName)}`;
        questAurl += `?class_name=${encodeURIComponent(selectedClassName)}`;
      }

      console.log('questAurl=',questAurl);
      

      // Mengambil semua submission beserta filternya
      const resSubs = await api.get(url);

      // Kita ambil array yang ada DI DALAM object tersebut
      const subsArray = resSubs.data?.submissions || []; 
      setSubmissions(subsArray);

      const questA = await api.get(questAurl);
      setQuestionAnalytics(questA.data.question_analysis); // Sesuaikan jika response dibungkus data.data

    } catch (error) {
      console.error("Gagal ambil detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchDetail();

}, [id, selectedClassName]); // <-- Trigger ulang saat selectedClassName berubah

  

  

  // useEffect(() => {
  //   if (id) fetchDetail();
  // }, [id]);

  // 2. Logic Publish
  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      // Panggil API Backend (Pastikan route-nya benar)
      // PATCH /assessments/:id/publish
      await api.patch(`/assessments/${id}/publish`); 
      
      // Refresh data agar status berubah jadi PUBLISHED di layar
      
      window.location.reload();
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
        selectedClassName={selectedClassName || ''}
        distinctClasses={distinctClasses}
        setSelectedKeys={setSelectedKeys} selectedKeys={""}      />


      
      {/* table cotnent COMPONENT (Bersih kan?) */}
      <AssessmentDetailTabs 
        assessmentId={id}
        submissions={submissions}
        question_analytics={questionAnalytics}
        assessment_status={assessment.assessment_status}
        selectedClassName={selectedClassName || ''}
      />

        {/* PANGGIL KOMPONEN ANALYTICS DI SINI */}
        {/* <AssessmentAnalytics assessmentId={id} /> */}


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