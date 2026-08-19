// apps/web/app/(dashboard)/question-bank/page.tsx
import { getServerSession } from "@/lib/auth/session";
import QuestionBankClient from "@/features/question-bank/components/QuestionBankList";

export default async function QuestionBankPage() {
  // 1. Ekstrak Sesi (Hanya jalan di Server)
  const session = await getServerSession();

  // 2. Validasi Keamanan (Solusi untuk error "string | undefined")
  // Jika tidak ada sesi, jangan render komponennya.
  if (!session || !session.userId) {
    return (
      <div className="p-10 text-center text-red-500">
        <h2 className="text-xl font-bold">Akses Ditolak</h2>
        <p>Anda harus login untuk mengakses halaman ini.</p>
      </div>
    );
  }

  // 3. Render komponen Client dan oper userId yang sudah 100% PASTI string
  return (
    <main className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <QuestionBankClient userId={session.userId} />
    </main>
  );
}