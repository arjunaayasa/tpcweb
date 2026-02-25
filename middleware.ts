import { NextRequest, NextResponse } from 'next/server';
import { fetchAuthMe, AUTH_BASE_URL, SSO_COOKIE_NAME } from '@/lib/sso';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow SSO callback and public login/register redirects
  if (
    pathname.startsWith('/api/auth/sso/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register')
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SSO_COOKIE_NAME)?.value;

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const user = await fetchAuthMe(request.headers.get('cookie'), AUTH_BASE_URL);
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    // Only admins can access /admin-tpc
    if (pathname.startsWith('/admin-tpc') && user.role !== 'ADMIN') {
      const profileUrl = new URL('/my-profile', request.url);
      return NextResponse.redirect(profileUrl);
    }
    return NextResponse.next();
  } catch {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/admin-tpc/:path*'],
};
