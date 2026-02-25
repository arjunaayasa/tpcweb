import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/sso';

export const runtime = 'nodejs';

// Proxy GET — list all addon prices
export async function GET(request: Request) {
  try {
    const base = await getBackendUrl();
    const upstream = await fetch(`${base}/api/admin/ai-addon-prices`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        cookie: request.headers.get('cookie') ?? '',
      },
      cache: 'no-store',
    });

    const payload = await upstream.text();
    const response = new NextResponse(payload, { status: upstream.status });
    const ct = upstream.headers.get('content-type');
    if (ct) response.headers.set('content-type', ct);
    return response;
  } catch {
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
  }
}

// Proxy POST — create/update addon price
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const base = await getBackendUrl();
    const upstream = await fetch(`${base}/api/admin/ai-addon-prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        cookie: request.headers.get('cookie') ?? '',
      },
      body,
    });

    const payload = await upstream.text();
    const response = new NextResponse(payload, { status: upstream.status });
    const ct = upstream.headers.get('content-type');
    if (ct) response.headers.set('content-type', ct);
    return response;
  } catch {
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
  }
}

// Proxy DELETE — delete addon price
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const addon = url.searchParams.get('addon');
    const interval = url.searchParams.get('interval');

    const base = await getBackendUrl();
    const upstream = await fetch(
      `${base}/api/admin/ai-addon-prices?addon=${addon}&interval=${interval}`,
      {
        method: 'DELETE',
        headers: {
          accept: 'application/json',
          cookie: request.headers.get('cookie') ?? '',
        },
      }
    );

    const payload = await upstream.text();
    const response = new NextResponse(payload, { status: upstream.status });
    const ct = upstream.headers.get('content-type');
    if (ct) response.headers.set('content-type', ct);
    return response;
  } catch {
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
  }
}
