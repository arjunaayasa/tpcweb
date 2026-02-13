import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/sso';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const base = await getBackendUrl();
    const upstream = await fetch(`${base}/api/me/avatar`, {
      headers: {
        cookie: request.headers.get('cookie') ?? '',
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

export async function PUT(request: Request) {
  try {
    const body = await request.text();
    const base = await getBackendUrl();
    const upstream = await fetch(`${base}/api/me/avatar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        cookie: request.headers.get('cookie') ?? '',
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
