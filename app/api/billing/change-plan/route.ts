import { NextResponse } from 'next/server';
import { AUTH_BASE_URL } from '@/lib/sso';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const upstream = await fetch(`${AUTH_BASE_URL}/api/billing/change-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        cookie: request.headers.get('cookie') ?? '',
        ...(process.env.BILLING_API_KEY
          ? { 'x-api-key': process.env.BILLING_API_KEY }
          : {}),
      },
      body,
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
