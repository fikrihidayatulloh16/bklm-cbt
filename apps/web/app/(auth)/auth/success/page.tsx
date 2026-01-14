'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { Spinner } from "@nextui-org/react";

function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Tangkap token dari URL
    const token = searchParams.get('token');

    if (token) {
      // 2. Simpan ke Cookie (PENTING!)
      // Token ini yang nanti dicek oleh Checkpoint 1 & 2
      Cookies.set('token', token, { expires: 1, path: '/' });

      // 3. Redirect ke Dashboard setelah token aman
      router.push('/dashboard');
      router.refresh(); // Pastikan state auth ter-refresh
    } else {
      console.error("Token tidak ditemukan di URL");
      // Opsional: Redirect ke login jika gagal
      setTimeout(() => router.push('/login'), 2000);
    }
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Spinner size="lg" color="primary" />
      <p className="text-default-500 font-medium">Sedang memproses login...</p>
    </div>
  );
}

// Wajib dibungkus Suspense di Next.js App Router saat pakai useSearchParams
export default function AuthSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthSuccessContent />
    </Suspense>
  );
}