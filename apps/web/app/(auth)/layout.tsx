export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // UBAH BARIS INI:
    // Kita ganti bg-blue-50 jadi gradasi (bg-gradient-to-br)
    // from-blue-600 to-indigo-900 artinya dari biru terang ke ungu gelap
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 p-4">
      
      <div className="w-full max-w-md">
        {/* Efek Glassmorphism (Kaca) di belakang form */}
        <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden p-1">
            {children}
        </div>
        
        {/* Footer kecil */}
        <p className="text-center text-white/60 text-xs mt-6">
          &copy; 2026 BKLM CBT System. Secure Login.
        </p>
      </div>
    </div>
  );
}