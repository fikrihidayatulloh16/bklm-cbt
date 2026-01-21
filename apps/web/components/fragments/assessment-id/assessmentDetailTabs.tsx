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
}



export default function AssessmentDetailTabs({ submissions, assessmentId, question_analytics }: AssessmentDetailTabsProps) {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // 1. TAMBAHKAN STATE LOADING DOWNLOAD (Agar tombol tidak dipencet 2x)
    const [isDownloading, setIsDownloading] = useState(false);

    // 2. LOGIC DOWNLOAD EXCEL (Ganti alert lama dengan ini)
    const handleDownload = async () => {
        if (isDownloading) return; // Cegah double click
        setIsDownloading(true);

        try {
            // A. REQUEST KE API DENGAN TIPE 'BLOB'
            const response = await api.get(`/assessments/${assessmentId}/export-excel`, {
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

