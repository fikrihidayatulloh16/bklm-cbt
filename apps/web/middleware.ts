import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // Daftar halaman yang dilindungi
  const protectedPaths = ['/dashboard', '/assessment', '/profile'];

  const isProtected = protectedPaths.some((p) => path.startsWith(p));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (path.startsWith('/login') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // ✅ PASTIKAN TIDAK DI-COMMENT LAGI
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth/success).*)',
  ],
};