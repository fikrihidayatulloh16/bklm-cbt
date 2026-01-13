import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 p-4">
      <div className="font-bold text-xl mb-8">BKLM ADMIN</div>
      <nav className="flex flex-col gap-2">
        <Link href="/dashboard" className="p-2 hover:bg-gray-800 rounded">Dashboard</Link>
        <Link href="/assessments" className="p-2 hover:bg-gray-800 rounded">Bank Soal</Link>
        <Link href="/students" className="p-2 hover:bg-gray-800 rounded">Data Siswa</Link>
      </nav>
    </aside>
  );
}