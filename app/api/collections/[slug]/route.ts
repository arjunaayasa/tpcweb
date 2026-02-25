import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/sso';

export const runtime = 'nodejs';

/** PATCH /api/collections/[slug] — proxy to TPC-AI backend (update allowedPlans) */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.text();
    const base = await getBackendUrl();
    const upstream = await fetch(`${base}/api/collections/${slug}`, {
      method: 'PATCH',
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
    if (contentType) response.headers.set('content-type', contentType);
    return response;
  } catch {
    return NextResponse.json({ error: 'Auth service unavailable.' }, { status: 502 });
  }
}
