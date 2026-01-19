import { useEffect, useState } from "react";
import api from "@/lib/api"; // Sesuaikan import api

// Interface sesuai response Postman Anda
interface StudentRank {
  id: string;
  student_name: string;
  class_name: string;
  score: number;
}

interface QuestionAnalysis {
  question_id: string;
  question_text: string;
  category: string;
  total_risk_score: number;
  respondents: number;
  risk_percentage: string; // "80.0%"
}

interface AnalyticsData {
  studentRanks: StudentRank[];
  question_analysis: QuestionAnalysis[];
}

export default function AssessmentAnalytics({ assessmentId }: { assessmentId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get(`/assessments/${assessmentId}/analytics`);
        setData(res.data); // Sesuaikan jika response dibungkus data.data
      } catch (error) {
        console.error("Gagal ambil analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) fetchAnalytics();
  }, [assessmentId]);

  if (loading) return <div className="p-4 text-gray-500">Sedang memuat analisis...</div>;
  if (!data) return null;

  return (
    <div className="space-y-8 mt-6">
      
      {/* BAGIAN 1: RANKING SISWA (PETA KERAWANAN) */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          🚨 Siswa Butuh Perhatian (Top 10)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Nama Siswa</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3 text-right">Skor Kerawanan</th>
              </tr>
            </thead>
            <tbody>
              {data.studentRanks.length > 0 ? (
                data.studentRanks.map((student, index) => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-500">#{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{student.student_name}</td>
                    <td className="px-4 py-3 text-gray-600">{student.class_name}</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">
                      {student.score}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-400">Belum ada data siswa selesai.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BAGIAN 2: ANALISIS SOAL (MASALAH UMUM) */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          📊 Masalah Paling Umum di Kelas Ini
        </h3>
        <div className="space-y-5">
          {data.question_analysis.map((q) => {
            // Kita ubah string "80.0%" jadi angka 80 untuk width CSS
            const percentage = parseFloat(q.risk_percentage);
            
            return (
              <div key={q.question_id}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 w-3/4 truncate">
                    {q.question_text}
                  </span>
                  <span className="text-sm font-bold text-red-600">{q.risk_percentage}</span>
                </div>
                
                {/* Visualisasi Bar Chart Sederhana */}
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-red-500 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Kategori: {q.category || "-"} • {q.total_risk_score} dari {q.respondents} siswa menjawab "Ya"
                </div>
              </div>
            );
          })}
          
          {data.question_analysis.length === 0 && (
             <p className="text-gray-400 text-center">Belum ada data jawaban.</p>
          )}
        </div>
      </div>

    </div>
  );
}