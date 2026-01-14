import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Ambil token dari Cookie browser
  const token = request.cookies.get('token')?.value;
  
  // 2. Ambil path URL yang sedang dituju
  const path = request.nextUrl.pathname;

  // RULE A: Proteksi Halaman Dashboard (Wajib Login)
  // Jika url diawali '/dashboard' DAN tidak punya token
  if (path.startsWith('/dashboard') && !token) {
    // Redirect paksa ke login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // RULE B: Proteksi Halaman Auth (Wajib Logout)
  // Jika url diawali '/login' DAN sudah punya token
  // (User iseng mau buka halaman login padahal sudah login)
  if (path.startsWith('/login') && token) {
    // Redirect balik ke dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Lanjut boleh masuk
  return NextResponse.next();
}

// Konfigurasi: Middleware ini hanya aktif di route mana saja?
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/success (Halaman penangkap token jangan di-block)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth/success).*)',
  ],
};