import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/sso';

export const runtime = 'nodejs';

/**
 * Proxies the authenticated user's latest KYC submission + eligibility window
 * from the backend (`GET /api/kyc/me`). Cookie-based auth is forwarded.
 */
export async function GET(request: Request) {
  try {
    const base = await getBackendUrl();
    const upstream = await fetch(`${base}/api/kyc/me`, {
      headers: {
        cookie: request.headers.get('cookie') ?? '',
        accept: 'application/json',
      },
      cache: 'no-store',
    });

    const payload = await upstream.text();
    const response = new NextResponse(payload, { status: upstream.status });

    const contentType = upstream.headers.get('content-type');
    if (contentType) {
      response.headers.set('content-type', contentType);
    }

    return response;
  } catch {
    return NextResponse.json({ error: 'Auth service unavailable.' }, { status: 502 });
  }
}
