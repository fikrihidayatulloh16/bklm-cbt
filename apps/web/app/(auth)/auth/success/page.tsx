'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { Spinner } from "@nextui-org/react";

function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // ✅ SETUP COOKIE FINAL
      Cookies.set('token', token, { 
        expires: 1, 
        path: '/', // WAJIB ADA
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'Lax' 
      });

      window.location.href = '/dashboard'; 
    } else {
      setTimeout(() => router.push('/login'), 1000);
    }
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Spinner size="lg" color="primary" />
      <p className="text-default-500 font-medium">Sedang memproses login...</p>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthSuccessContent />
    </Suspense>
  );
}