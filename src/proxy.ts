import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === '/login' ||
    pathname === '/esqueci-senha' ||
    pathname === '/redefinir-senha' ||
    pathname === '/api/auth/login' ||
    pathname === '/api/auth/esqueci-senha' ||
    pathname === '/api/auth/redefinir-senha' ||
    pathname === '/api/init' ||
    pathname.startsWith('/api/cron/')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (
    payload.mustChangePassword &&
    pathname !== '/trocar-senha' &&
    !pathname.startsWith('/api/')
  ) {
    return NextResponse.redirect(new URL('/trocar-senha', request.url));
  }

  if (pathname.startsWith('/docente') && payload.role !== 'docente') {
    return NextResponse.redirect(new URL('/gestor', request.url));
  }

  if (pathname.startsWith('/gestor') && payload.role === 'docente') {
    return NextResponse.redirect(new URL('/docente', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp).*)'],
};
