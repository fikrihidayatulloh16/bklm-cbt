"use client";

import { useParams } from 'next/navigation'; // 👈 Tambahkan ini
import { useStudentAnswerDetailLogic } from '@/features/student-answer-details/hooks/useSADetailsLogic';
import { Spinner, Button, Divider, Card, CardBody, Chip } from '@nextui-org/react';
import { ArrowLeft } from 'lucide-react';
import NextLink from "next/link";

// 1. Ubah nama fungsi agar sesuai konteks, hapus parameter di dalam kurung
export default function StudentAnswerDetailPage() {
  
  // 2. Ambil ID dari URL menggunakan useParams
  const params = useParams();
  const assessmentId = params.id as string;
  const submissionId = params.submissionid as string;

  const { 
    isLoading, 
    studentDetail, 
    isError,
  } = useStudentAnswerDetailLogic(assessmentId, submissionId);

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!studentDetail) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
            {/* 3. Perbaiki URL kembali ke halaman Assessment Detail */}
            <Button as={NextLink} isIconOnly variant="light" href={`/assessments/${assessmentId}`}>
                <ArrowLeft size={20} />
            </Button>
            <div>
                <h1 className="text-2xl font-bold">{studentDetail.student_name}</h1>
                <p className="text-default-500 text-sm">Jenis Kelamin: {studentDetail.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}</p>
                <p className="text-default-500 text-sm">Ujian: {studentDetail.assessment_title}</p>
                <p className="text-default-500 text-sm">Nilai: {studentDetail.student_scores}</p>
            </div>
        </div>
      </div>

      <Divider />

      {/* LIST SOAL */}
      <div className="space-y-4">
        {studentDetail.questions && studentDetail.questions.length > 0 ? (
            studentDetail.questions.map((q, index) => (
                // 4. Tambahkan key={index} di sini
                <Card key={index} className="border border-default-200" shadow="sm">
                  <CardBody className="gap-3">
                    
                    {/* Header Soal */}
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2 items-center">
                        <Chip size="sm" color="primary" variant="flat">No. {index + 1}</Chip>
                        <Chip size="sm" variant="bordered">{q.type}</Chip>
                        <span className="text-xs font-bold text-default-400 uppercase tracking-wider">
                          {q.category}
                        </span>
                      </div>
                    </div>

                    {/* Teks Soal */}
                    <div className="text-lg font-medium text-default-800 pl-1">
                      {q.text}
                    </div>

                    {/* 5. Tampilan Jawaban Siswa Dipercantik */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 p-3 bg-default-50 rounded-lg border border-default-100">
                        <div>
                            <span className="text-xs text-default-500 block mb-1">Jawaban Siswa:</span>
                            {/* Gunakan selected_answer sesuai JSON backend baru */}
                            <span className="font-semibold text-primary">
                                {q.selected_answer || <span className="text-warning italic">Tidak dijawab atau jawaban lain.</span>}
                            </span>
                        </div>
                        
                        <div className="mt-2 sm:mt-0">
                            {q.score > 0 ? (
                                <Chip color="success" variant="flat" size="sm">
                                    Poin: {q.score}
                                </Chip>
                            ) : (
                                <Chip color="default" variant="flat" size="sm">
                                    Poin: 0
                                </Chip>
                            )}
                        </div>
                    </div>

                  </CardBody>
                </Card>
            ))
        ) : (
            // 6. Perbaiki teks empty state
            <div className="text-center py-10 text-default-400 bg-default-50 rounded-lg">
                Tidak ada data jawaban yang ditemukan untuk siswa ini.
            </div>
        )}
      </div>
    </div>
  );
}