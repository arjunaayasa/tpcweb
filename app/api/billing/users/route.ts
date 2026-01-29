import { NextResponse } from 'next/server';
import { AUTH_BASE_URL } from '@/lib/sso';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const upstreamUrl = new URL('/api/billing/users', AUTH_BASE_URL);
    const params = upstreamUrl.searchParams;
    const q = url.searchParams.get('q');
    const plan = url.searchParams.get('plan');
    const role = url.searchParams.get('role');

    if (q) params.set('q', q);
    if (plan) params.set('plan', plan);
    if (role) params.set('role', role);

    const headers: Record<string, string> = {
      accept: 'application/json',
    };
    const cookie = request.headers.get('cookie');
    if (cookie) {
      headers.cookie = cookie;
    }
    const apiKey = process.env.BILLING_API_KEY;
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    const upstream = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers,
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
