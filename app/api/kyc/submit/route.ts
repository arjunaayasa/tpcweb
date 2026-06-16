import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/sso';

export const runtime = 'nodejs';

/**
 * Proxies a KYC submission (multipart/form-data) to the backend
 * `POST /api/kyc/submit`. Cookie-based auth is forwarded; the original
 * Content-Type (with its multipart boundary) is preserved.
 */
export async function POST(request: Request) {
  try {
    const base = await getBackendUrl();
    const contentType = request.headers.get('content-type') ?? '';
    const body = await request.arrayBuffer();

    const upstream = await fetch(`${base}/api/kyc/submit`, {
      method: 'POST',
      headers: {
        cookie: request.headers.get('cookie') ?? '',
        accept: 'application/json',
        ...(contentType ? { 'content-type': contentType } : {}),
      },
      body,
    });

    const payload = await upstream.text();
    const response = new NextResponse(payload, { status: upstream.status });
    const resContentType = upstream.headers.get('content-type');
    if (resContentType) {
      response.headers.set('content-type', resContentType);
    }
    return response;
  } catch {
    return NextResponse.json({ error: 'Layanan KYC tidak tersedia.' }, { status: 502 });
  }
}
