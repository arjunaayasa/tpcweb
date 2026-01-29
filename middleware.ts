import { NextRequest, NextResponse } from 'next/server';
import { fetchAuthMe, SSO_COOKIE_NAME } from '@/lib/sso';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin-tpc/login')) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SSO_COOKIE_NAME)?.value;

  if (!session) {
    const loginUrl = new URL('/admin-tpc/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const user = await fetchAuthMe(request.headers.get('cookie'));
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== 'ADMIN') {
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
