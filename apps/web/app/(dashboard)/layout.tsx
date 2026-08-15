import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar"; // Import Navbar Baru
import { jwtDecode } from 'jwt-decode';
import { cookies } from 'next/headers';
import { RealtimeSyncProvider } from "@/components/providers/RealtimeSyncProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
  
}) {
  const cookieStore = await cookies();
  const tokenString = cookieStore.get('token')?.value;
  let userId = '';

  if (tokenString) {
    try {
      const decoded = jwtDecode<{ sub: string }>(tokenString);
      userId = decoded.sub; // Ini "e81d484d-91c4-..."
    } catch (error) {
      console.error("Gagal mendecode JWT di Layout");
    }
  }
  return (
    <div className="min-h-screen bg-gray-200">
      
      
      {/* 1. Sidebar (Hanya muncul di Desktop) */}
      <Sidebar />

      {/* 2. Wrapper Konten Utama */}
      {/* md:ml-64 artinya: Di HP margin kiri 0, di Laptop margin kiri 64 (sebesar sidebar) */}
      <RealtimeSyncProvider userId={userId}>
      <main className="md:ml-64 min-h-screen flex flex-col">
        
        {/* 3. Navbar (Selalu muncul di atas) */}
        <TopNavbar />
        
        {/* 4. Konten Halaman (Dashboard/Assessment) */}
        <div className="p-4 md:p-8">
            {children}
        </div>
      </main>
    </RealtimeSyncProvider>
    </div>
  );
}