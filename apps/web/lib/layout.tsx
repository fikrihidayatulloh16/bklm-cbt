import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Statis - Dipanggil sekali disini */}
      <Sidebar />
      
      {/* Konten Dinamis (Berubah-ubah sesuai Page) */}
      <main className="ml-64 flex-1 p-8">
        <div className="bg-white rounded-lg shadow p-6 min-h-full">
            {children}
        </div>
      </main>
    </div>
  );
}