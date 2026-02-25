import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/sso';

export const runtime = 'nodejs';

/** GET /api/plan-models — proxy to TPC-AI backend */
export async function GET(request: Request) {
  try {
    const base = await getBackendUrl();
    const upstream = await fetch(`${base}/api/admin/plan-models`, {
      headers: {
        cookie: request.headers.get('cookie') ?? '',
      },
      cache: 'no-store',
    });
    const payload = await upstream.text();
    const response = new NextResponse(payload, { status: upstream.status });
    const contentType = upstream.headers.get('content-type');
    if (contentType) response.headers.set('content-type', contentType);
    return response;
  } catch {
    return NextResponse.json({ error: 'Auth service unavailable.' }, { status: 502 });
  }
}

/** PUT /api/plan-models — proxy to TPC-AI backend */
export async function PUT(request: Request) {
  try {
    const base = await getBackendUrl();
    const body = await request.text();
    const upstream = await fetch(`${base}/api/admin/plan-models`, {
      method: 'PUT',
      headers: {
        cookie: request.headers.get('cookie') ?? '',
        'content-type': 'application/json',
      },
      body,
    });
    const payload = await upstream.text();
    const response = new NextResponse(payload, { status: upstream.status });
    const contentType = upstream.headers.get('content-type');
    if (contentType) response.headers.set('content-type', contentType);
    return response;
  } catch {
    return NextResponse.json({ error: 'Auth service unavailable.' }, { status: 502 });
  }
}
