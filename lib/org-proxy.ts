import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/sso';

/**
 * Cookie-forwarding proxy helper for the Org-Admin portal.
 *
 * Each `/api/org/*` route relays the incoming request to the backend
 * (`portal.taxindo.ai`) using the org admin's own SSO session cookie. No
 * billing key is involved — these are admin-scoped reads/writes authorized
 * by the backend against the org ADMIN session.
 */
export async function relayOrg(
  request: Request,
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT',
  hasBody = false,
): Promise<NextResponse> {
  try {
    const base = await getBackendUrl();
    const cookie = request.headers.get('cookie') ?? '';

    const init: RequestInit = {
      method,
      headers: {
        cookie,
        accept: 'application/json',
      },
      cache: 'no-store',
    };

    if (hasBody) {
      const raw = await request.text();
      init.body = raw;
      (init.headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    const upstream = await fetch(`${base}${path}`, init);
    const payload = await upstream.text();
    const response = new NextResponse(payload, { status: upstream.status });

    const contentType = upstream.headers.get('content-type');
    if (contentType) {
      response.headers.set('content-type', contentType);
    }
    return response;
  } catch {
    return NextResponse.json({ error: 'Layanan organisasi tidak tersedia.' }, { status: 502 });
  }
}
