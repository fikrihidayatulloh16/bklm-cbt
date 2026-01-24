'use client';

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Button, Card, CardBody, Chip, Divider, Spinner, 
  Tabs, Tab, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Snippet, User
} from "@nextui-org/react";
import { BarChart3 } from "lucide-react";
import api from "@/lib/api";
import TabStudentRank, { Submission } from "./table-content/tabStudent";
import QuestionsAnalytics, { QuestionsAnalytic } from "./table-content/tabQuestion";



interface AssessmentDetailTabsProps {
  submissions: Submission[]; // Menerima ARRAY submission
  assessmentId: string;      // Menerima ID Assessment (jika butuh)
  question_analytics: QuestionsAnalytic[]
  assessment_status: string;
  selectedClassName: string;
}



export default function AssessmentDetailTabs({ submissions, assessmentId, question_analytics, assessment_status, selectedClassName }: AssessmentDetailTabsProps) {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // 1. TAMBAHKAN STATE LOADING DOWNLOAD (Agar tombol tidak dipencet 2x)
    const [isDownloading, setIsDownloading] = useState(false);

    // Aksi untuk menghadle sinkronisasi status submit siswa
    const handleSyncStatus = async () => {
        console.log('memasukki aksi handleSyncStatus');
        
        // 1. Cek loading state (Debounce sederhana)
        if (loading) return;
        setLoading(true); // Mulai Loading

        try {
            console.log('request api');
            // 2. Request API
            await api.patch(`/assessments/${assessmentId}/sync-status`);
            
            // 3. Success Feedback (HANYA jika tidak error)
            alert("Berhasil Sinkronisasi Data!");
            
            // 4. Refresh Halaman (Cara kasar tapi efektif)
            window.location.reload(); 

            // Opsi Lebih Baik (Jika ada):
            // await fetchStudentList(); // Refresh data tanpa reload page

        } catch (error) {
            console.log('memasukki aksi handleSyncStatus');
            console.error(error);
            // 5. Error Feedback
            alert("Gagal Sinkronisasi! Cek koneksi atau coba lagi.");
        } finally {
            // 6. Matikan Loading (Apapun hasilnya)
            setLoading(false);
        }
    };

    // 2. LOGIC DOWNLOAD EXCEL (Ganti alert lama dengan ini)
    const handleDownload = async () => {
        if (isDownloading) return; // Cegah double click
        setIsDownloading(true);

        try {
            //url export excel-awal
            let urlExportExel = `/assessments/${assessmentId}/export-excel`

            // Memeriksa apakah ada filter
            if (selectedClassName) {
                urlExportExel += `?class_name=${encodeURIComponent(selectedClassName)}`;
            }

            // A. REQUEST KE API DENGAN TIPE 'BLOB'
            const response = await api.get(urlExportExel, {
                responseType: 'blob', // <--- MANTRA PENTING! (Jangan lupa ini)
            });

            // B. BUAT LINK DOWNLOAD SEMENTARA
            // Kita bungkus data binary tadi menjadi URL virtual
            const url = window.URL.createObjectURL(new Blob([response.data]));
            
            // C. BUAT ELEMENT <A> SECARA PROGRAMMATIC
            const link = document.createElement('a');
            link.href = url;
            // Nama file default (bisa dioverride header backend, tapi aman diset disini juga)
            link.setAttribute('download', `Laporan_Analisis_${assessmentId}.xlsx`); 
            
            // D. KLIK OTOMATIS & BERSIHKAN
            document.body.appendChild(link);
            link.click();
            
            // Hapus jejak
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Gagal download:", error);
            alert("Gagal mengunduh file. Coba lagi nanti.");
        } finally {
            setIsDownloading(false);
        }
    };
    
    return(
    <div> 
        
      <div className="mt-4">
        <Tabs aria-label="Assessment Options" color="primary" variant="underlined">
            
            {/* TAB 1: HASIL SISWA */}
            <Tab key="results" title={
                <div className="flex items-center gap-2 text-dark">
                    <BarChart3 size={18} />
                    <span>Hasil & Nilai</span>
                </div>
            }>
                <div className="mt-4">
                    <TabStudentRank 
                        submissions={submissions} 
                        assessmentId={assessmentId}
                        handleSyncStatus={handleSyncStatus}
                        loading={loading}
                        assessment_status={assessment_status}
                    />
                </div>
            </Tab>

            {/* TAB 2: DAFTAR SOAL (Placeholder) */}
            <Tab key="questions" title="Daftar Soal">
                <div className="mt-4">
                    {question_analytics ? 
                        <QuestionsAnalytics
                            questionsAnalytic={question_analytics}
                            assessmentId={assessmentId}
                            onDownload={handleDownload}
                            isDownloading={isDownloading}
                        /> :
                        <div className="mt-4 p-8 border border-dashed rounded-lg bg-default-50 text-center text-default-500">
                            <p>Daftar soal akan ditampilkan di sini.</p>
                        </div>
                    }
                </div>
            </Tab>

            <Tab key="download" title="Unduh">
                 <div className="mt-4 p-8 border border-dashed rounded-lg bg-default-50 text-center text-default-500">
                    <p>unduh laporan akan di sini.</p>
                 </div>
            </Tab>
        </Tabs>
      </div>

      </div>
    )
}

