import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // API routes ve static files için middleware çalıştırma
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('sekreteryaapp_session');

  // Login sayfası kontrolü
  if (pathname === '/login') {
    // Zaten giriş yapmış kullanıcıyı admin'e yönlendir
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // Admin routes kontrolü
  if (pathname.startsWith('/admin')) {
    // Cookie yoksa login'e yönlendir
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Root için - Client-side handle ediyor, middleware'den geç
  if (pathname === '/') {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/login',
  ],
};

