'use client';

import { Card, CardHeader, CardBody, Button, Divider } from "@nextui-org/react";
import Link from "next/link";

export default function LoginPage() {
  
  // Fungsi untuk memanggil endpoint Login Google di Backend
  const handleGoogleLogin = () => {
    // GUNAKAN process.env.NEXT_PUBLIC_API_URL
    // Ini akan otomatis berubah jadi https://api-app1... saat di server
    // dan tetap localhost saat di laptop.
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Selamat Datang</h1>
        <p className="text-gray-500 text-sm">Masuk untuk mengelola ujian CBT</p>
      </div>

      <Card className="w-full max-w-[400px]">
        <CardHeader className="flex gap-3 justify-center py-4 bg-gray-50">
           <div className="font-bold text-lg text-primary">BKLM SYSTEM</div>
        </CardHeader>
        <Divider/>
        <CardBody className="flex flex-col gap-6 p-8">
          
          <Button 
            color="primary" 
            size="lg" 
            variant="shadow"
            onPress={handleGoogleLogin}
            className="w-full font-semibold"
          >
            {/* Kita pakai icon Google sederhana */}
            <svg className="w-5 h-5 mr-2 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Masuk dengan Google
          </Button>

          <div className="text-center text-xs text-gray-400">
            Masalah saat login? <Link href="#" className="text-blue-500 hover:underline">Hubungi Admin</Link>
          </div>
        </CardBody>
      </Card>
      
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 mt-4">
        &larr; Kembali ke Halaman Utama
      </Link>
    </div>
  );
}