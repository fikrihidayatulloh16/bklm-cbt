import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar"; // Import Navbar Baru

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-300">
      
      {/* 1. Sidebar (Hanya muncul di Desktop) */}
      <Sidebar />

      {/* 2. Wrapper Konten Utama */}
      {/* md:ml-64 artinya: Di HP margin kiri 0, di Laptop margin kiri 64 (sebesar sidebar) */}
      <main className="md:ml-64 min-h-screen flex flex-col">
        
        {/* 3. Navbar (Selalu muncul di atas) */}
        <TopNavbar />
        
        {/* 4. Konten Halaman (Dashboard/Assessment) */}
        <div className="p-4 md:p-8">
            {children}
        </div>
      </main>

    </div>
  );
}