import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar"; // Import Navbar Baru
import { jwtDecode } from 'jwt-decode';
import { cookies } from 'next/headers';
import { RealtimeSyncProvider } from "@/components/providers/RealtimeSyncProvider";
import { getServerSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
  
}) {
  const cookieStore = await cookies();
  const tokenString = cookieStore.get('token')?.value;
  const session = await getServerSession();


  const testingSchoolId = "school-bklm-default-001";
  return (
    <div className="min-h-screen bg-gray-200">
      
      
      {/* 1. Sidebar (Hanya muncul di Desktop) */}
      <Sidebar />

      {/* 2. Wrapper Konten Utama */}
      {/* md:ml-64 artinya: Di HP margin kiri 0, di Laptop margin kiri 64 (sebesar sidebar) */}
      <RealtimeSyncProvider userId={session?.userId} schoolId={session?.schoolId || undefined}>
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