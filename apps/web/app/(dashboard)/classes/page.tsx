// apps/web/app/(dashboard)/classes/page.tsx
import { Metadata } from "next";
import { getServerSession } from "@/lib/auth/session";
import ClassList from "@/features/classes/components/ClassList"; // Sesuaikan path alias Anda

export const metadata: Metadata = {
  title: "Manajemen Kelas | CBT BKLM",
  description: "Kelola daftar kelas dan rombongan belajar",
};

export default async function ClassesPage() {
  // =====================================================================
  // 1. AMBIL DATA SESSION / TOKEN
  // =====================================================================
  // 1. Ambil Sesi (Hanya 1 baris, sangat elegan!)
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

  // =====================================================================
  // 3. RENDER UI
  // =====================================================================
  return (
    // Tambahkan padding dan pembatas lebar agar rapi di layar lebar
    <main className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <ClassList schoolId={session.schoolId} />
    </main>
  );
}