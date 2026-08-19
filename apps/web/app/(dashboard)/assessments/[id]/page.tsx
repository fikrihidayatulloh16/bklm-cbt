// apps/web/app/(dashboard)/assessments/[id]/page.tsx
import { getServerSession } from "@/lib/auth/session";
import AssessmentDetailClient from "@/features/assessments/components/AssessmentDetailClient";

// Server Component BOLEH async, TAPI TIDAK BOLEH ada 'use client'
export default async function AssessmentDetailPage({ params }: { params: { id: string } }) {
  // 1. Eksekusi fungsi Server (Aman!)
  const session = await getServerSession();

  // 2. Validasi Keamanan (Cek apakah dia login dan punya sekolah)
  if (!session || !session.schoolId) {
    return (
      <div className="flex items-center justify-center h-full p-10">
        <div className="text-center text-red-500">
          <h2 className="text-xl font-bold">Akses Ditolak</h2>
          <p>Anda belum terdaftar di sekolah manapun atau sesi telah habis.</p>
        </div>
      </div>
    );
  }

  // 3. Panggil "Anak" (Client Component) dan oper data yang dibutuhkan
  return (
    <AssessmentDetailClient 
      assessmentId={params.id}
      schoolId={session.schoolId} 
    />
  );
}