import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/sso';

export const runtime = 'nodejs';

const forwardAuthRequest = async (request: Request, path: string) => {
  const body = await request.text();
  const base = await getBackendUrl();
  const upstream = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body,
  });

  // Handle JSON response modification to inject sessionToken if needed
  try {
    const data = await upstream.json();

    // Check for Set-Cookie header to extract sessionToken
    const setCookies = typeof upstream.headers.getSetCookie === 'function'
      ? upstream.headers.getSetCookie()
      : [upstream.headers.get('set-cookie')].filter(Boolean) as string[];

    let sessionToken = data.sessionToken;

    if (!sessionToken && setCookies.length > 0) {
      // Find tpc_session
      const sessionCookie = setCookies.find(c => c.includes('tpc_session='));
      if (sessionCookie) {
        const match = sessionCookie.match(/tpc_session=([^;]+)/);
        if (match) {
          sessionToken = decodeURIComponent(match[1]);
          data.sessionToken = sessionToken;
        }
      }
    }

    const response = NextResponse.json(data, { status: upstream.status });

    // Copy headers (Set-Cookie needs special handling)
    if (setCookies.length) {
      setCookies.forEach(cookie => response.headers.append('set-cookie', cookie));
    }

    return response;

  } catch (e) {
    // Fallback for non-JSON response
    const payload = await upstream.text();
    const response = new NextResponse(payload, {
      status: upstream.status,
    });

    const contentType = upstream.headers.get('content-type');
    if (contentType) response.headers.set('content-type', contentType);

    const setCookies = typeof upstream.headers.getSetCookie === 'function'
      ? upstream.headers.getSetCookie()
      : [upstream.headers.get('set-cookie')].filter(Boolean) as string[];

    setCookies.forEach(cookie => response.headers.append('set-cookie', cookie));

    return response;
  }
};

export async function POST(request: Request) {
  try {
    return await forwardAuthRequest(request, '/api/auth/register');
  } catch (error) {
    return NextResponse.json(
      { error: 'Auth service unavailable.' },
      { status: 502 },
    );
  }
}
