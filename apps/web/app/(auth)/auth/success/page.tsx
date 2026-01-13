'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { Spinner } from "@nextui-org/react";

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Ambil token dari URL (?token=...)
    const token = searchParams.get('token');

    if (token) {
      // 2. Simpan ke Cookie Browser
      // Token berlaku 1 hari, path '/' artinya bisa dibaca di semua halaman
      Cookies.set('token', token, { expires: 1, path: '/' });

      // 3. Redirect ke Dashboard (Ganti URL jadi bersih)
      // Gunakan window.location agar halaman refresh penuh & state terupdate
      window.location.href = '/dashboard';
    } else {
      // Kalau iseng buka halaman ini tanpa token, balikin ke login
      router.push('/login');
    }
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-[300px] gap-4">
      <Spinner size="lg" color="primary" />
      <p className="text-gray-600 font-medium animate-pulse">
        Sedang memverifikasi data login...
      </p>
    </div>
  );
}