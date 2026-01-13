import Link from "next/link";

export default function Sidebar() {
  return (
    // UBAH BARIS INI: Tambahkan 'hidden md:flex' dan z-index
    <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 p-4 z-50">
      
      <div className="font-bold text-xl mb-10 px-2 flex items-center gap-2">
         🏫 <span>BKLM ADMIN</span>
      </div>
      
      <nav className="flex flex-col gap-2">
        <Link href="/dashboard" className="p-3 hover:bg-gray-800 rounded-lg flex gap-3 items-center transition-colors">
            <span>📊</span> Dashboard
        </Link>
        <Link href="/dashboard/assessments" className="p-3 hover:bg-gray-800 rounded-lg flex gap-3 items-center transition-colors">
            <span>📝</span> Bank Soal
        </Link>
        <Link href="/dashboard/students" className="p-3 hover:bg-gray-800 rounded-lg flex gap-3 items-center transition-colors">
            <span>👥</span> Data Siswa
        </Link>
        <Link href="#" className="p-3 hover:bg-gray-800 rounded-lg flex gap-3 items-center transition-colors mt-auto text-red-400">
            <span>🚪</span> Logout
        </Link>
      </nav>
      
      <div className="mt-auto p-4 text-xs text-gray-500 text-center">
        v1.0.0 Alpha
      </div>
    </aside>
  );
}