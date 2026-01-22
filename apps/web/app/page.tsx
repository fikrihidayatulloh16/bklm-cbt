import { Link } from "@nextui-org/react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        BKLM CBT System
      </h1>
      <p className="text-gray-600">
        Platform Ujian Online Sekolah
      </p>
      
      <div className="mt-8 flex gap-4">
        <Link href="/login">
          <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Login Guru
          </button>
        </Link>

        <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
          Mulai Ujian (Siswa)
        </button>
      </div>
    </main>
  );
}