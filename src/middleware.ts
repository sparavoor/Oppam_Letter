import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAME } from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  console.log(`[Middleware] Path: ${pathname}, HasToken: ${!!token}`);

  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/admin/login';

  // If trying to access admin pages and has no session token, redirect to login
  if (isAdminRoute && !isLoginRoute && !token) {
    const loginUrl = new URL('/admin/login', request.url);
    console.log(`[Middleware] Redirecting to: ${loginUrl}`);
    return NextResponse.redirect(loginUrl);
  }

  console.log(`[Middleware] Proceeding next`);
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
