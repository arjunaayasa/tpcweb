import { NextResponse } from 'next/server';
import { AUTH_BASE_URL, SSO_COOKIE_NAME } from '@/lib/sso';

export async function POST(request: Request) {
  try {
    await fetch(`${AUTH_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        cookie: request.headers.get('cookie') ?? '',
      },
    });
  } catch {
    // ignore
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SSO_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
