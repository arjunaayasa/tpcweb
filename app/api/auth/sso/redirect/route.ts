import { NextResponse } from 'next/server';
import { SSO_COOKIE_NAME } from '@/lib/sso';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const next = searchParams.get('next') || '/chat';

    if (!token) {
        return NextResponse.redirect(new URL('/login?error=missing_token', request.url));
    }

    // Use absolute URL for redirect to be safe, though relative works in NextResponse
    const redirectUrl = new URL(next, request.url);
    const response = NextResponse.redirect(redirectUrl);

    // Set the cookie
    // We match the existing cookie config (Path=/, HttpOnly, SameSite=Lax usually)
    // MaxAge? Typically session cookies or long lived. Let's assume 7 days or rely on default?
    // lib/sso.ts doesn't define maxAge, usually backend does.
    // Here we are creating it manually.

    response.cookies.set(SSO_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        // maxAge: 60 * 60 * 24 * 7 // 7 days? Or leave session?
        // Backend usually sets it. If we bridge, we might want to respect backend expiry but we don't know it.
        // Setting it as session cookie (no maxAge) or a reasonable default.
        maxAge: 60 * 60 * 24 * 30, // 30 days to be safe
    });

    return response;
}
