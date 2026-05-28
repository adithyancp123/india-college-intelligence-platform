import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const isProtectedRoute = pathname.startsWith('/dashboard');

  const token = request.cookies.get('college_auth_token')?.value;

  if (isProtectedRoute && !token) {
    // Redirect unauthenticated user to login page
    const loginUrl = new URL('/login', request.url);
    // Keep track of the original page to redirect back after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/dashboard/:path*'],
};
