'use client';

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Button, Card, CardBody, Chip, Divider, Spinner, 
  Tabs, Tab, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Snippet, User
} from "@nextui-org/react";
import { ArrowLeft, Clock, Users, BarChart3 } from "lucide-react";
import api from "@/lib/api";

// --- 1. UPDATE INTERFACE (Sesuai Backend Service Anda) ---
interface Submission {
  id: string;
  student_name: string;
  class_name: string; // Tambahan dari backend
  score: number;
  status: "FINISHED" | "IN_PROGRESS";
  submitted_at: string | null;
}

interface AssessmentDetail {
  id: string;
  title: string;
  description?: string;
  duration: number;
  status: string;
  _count?: { questions: number; submissions: number };
}

// --- 2. MAP WARNA STATUS ---
const statusColorMap: Record<string, "success" | "warning" | "default"> = {
  FINISHED: "success",
  IN_PROGRESS: "warning",
};

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [data, setData] = useState<AssessmentDetail | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Link Ujian (URL Publik untuk Siswa)
  const examLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/exam/${id}` 
    : '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Ambil Detail Assessment (Untuk Header)
        const resDetail = await api.get(`/assessments/${id}`);
        setData(resDetail.data);

        // 2. Ambil Hasil/Submissions
        // PERBAIKAN PENTING DI SINI:
        // Backend mengembalikan Object { submissions: [...] }, bukan langsung Array [...]
        const resSubs = await api.get(`/assessments/${id}/results`);
        
        // Kita ambil array yang ada DI DALAM object tersebut
        const subsArray = resSubs.data?.submissions || []; 
        setSubmissions(subsArray);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="flex h-[50vh] items-center justify-center"><Spinner size="lg" label="Memuat data..." /></div>;
  if (!data) return <div className="text-center py-10">Data tidak ditemukan</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* --- HEADER: Navigasi & Judul --- */}
      <div className="flex flex-col gap-2">
        <Button 
            variant="light" 
            className="w-fit px-0 text-default-500" 
            startContent={<ArrowLeft size={18} />}
            onPress={() => router.back()}
        >
            Kembali ke Jadwal
        </Button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
                    {data.title}
                    <Chip color={data.status === 'PUBLISHED' ? "success" : "warning"} variant="flat" size="sm">
                        {data.status || "DRAFT"}
                    </Chip>
                </h1>
                <p className="text-default-500 text-sm mt-1">ID: {data.id}</p>
            </div>
            
            {/* LINK SHARE SECTION */}
            <div className="hidden md:block">
                 <Snippet symbol="#" color="primary" variant="flat" codeString={examLink}>
                    Link Ujian
                 </Snippet>
            </div>
        </div>
      </div>

      <Divider className="my-2"/>

      {/* --- STATISTIK RINGKAS (Layout Cards) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card shadow="sm">
            <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 bg-primary-100 text-primary rounded-lg"><Clock size={24} /></div>
                <div>
                    <p className="text-tiny text-default-500 uppercase font-bold">Durasi</p>
                    <h4 className="font-bold text-large">{data.duration || 60} Menit</h4>
                </div>
            </CardBody>
        </Card>
        <Card shadow="sm">
            <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 bg-secondary-100 text-secondary rounded-lg"><Users size={24} /></div>
                <div>
                    <p className="text-tiny text-default-500 uppercase font-bold">Partisipan</p>
                    {/* Menggunakan panjang array submissions yang valid */}
                    <h4 className="font-bold text-large">{submissions.length} Siswa</h4>
                </div>
            </CardBody>
        </Card>
      </div>

      {/* --- TABS SUBMISSIONS & DETAIL --- */}
      <div className="mt-4">
        <Tabs aria-label="Assessment Options" color="primary" variant="underlined">
            
            {/* TAB 1: HASIL SISWA */}
            <Tab key="results" title={
                <div className="flex items-center gap-2">
                    <BarChart3 size={18} />
                    <span>Hasil & Nilai</span>
                </div>
            }>
                <Card className="mt-4 shadow-sm border border-default-200">
                    <CardBody className="p-0">
                        {submissions.length > 0 ? (
                            <Table aria-label="Tabel Nilai Siswa" removeWrapper shadow="none">
                                <TableHeader>
                                    <TableColumn>NAMA SISWA</TableColumn>
                                    <TableColumn>KELAS</TableColumn>
                                    <TableColumn>WAKTU SUBMIT</TableColumn>
                                    <TableColumn>STATUS</TableColumn>
                                    <TableColumn>NILAI</TableColumn>
                                </TableHeader>
                                <TableBody items={submissions}>
                                    {(sub) => (
                                        <TableRow key={sub.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-none">
                                            <TableCell>
                                                <User 
                                                    name={sub.student_name} 
                                                    description="Siswa"
                                                    avatarProps={{src: `https://i.pravatar.cc/150?u=${sub.id}`}}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold text-gray-600">{sub.class_name || "-"}</span>
                                            </TableCell>
                                            <TableCell>
                                                {sub.submitted_at 
                                                  ? new Date(sub.submitted_at).toLocaleString('id-ID', {
                                                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                    })
                                                  : "-"
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <Chip size="sm" color={statusColorMap[sub.status]} variant="flat" className="capitalize">
                                                  {sub.status === "FINISHED" ? "Selesai" : "Mengerjakan"}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                {sub.status === "FINISHED" ? (
                                                  <span className={`font-bold text-lg ${sub.score < 70 ? 'text-danger' : 'text-success'}`}>
                                                    {sub.score}
                                                  </span>
                                                ) : (
                                                  <span className="text-gray-300">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12 text-default-400">
                                <p>Belum ada siswa yang mengerjakan ujian ini.</p>
                                <div className="mt-4 md:hidden">
                                     <p className="text-xs mb-2">Bagikan link ini ke siswa:</p>
                                     <Snippet symbol="" size="sm" color="default" codeString={examLink}>Copy Link</Snippet>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </Tab>

            {/* TAB 2: DAFTAR SOAL (Placeholder) */}
            <Tab key="questions" title="Daftar Soal">
                 <div className="mt-4 p-8 border border-dashed rounded-lg bg-default-50 text-center text-default-500">
                    <p>Daftar soal akan ditampilkan di sini.</p>
                 </div>
            </Tab>
        </Tabs>
      </div>
    </div>
  );
}