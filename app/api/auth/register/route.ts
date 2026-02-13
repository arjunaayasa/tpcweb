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

  const payload = await upstream.text();
  const response = new NextResponse(payload, {
    status: upstream.status,
  });

  const contentType = upstream.headers.get('content-type');
  if (contentType) {
    response.headers.set('content-type', contentType);
  }

  const setCookies = typeof upstream.headers.getSetCookie === 'function'
    ? upstream.headers.getSetCookie()
    : [];
  if (setCookies.length) {
    for (const cookie of setCookies) {
      response.headers.append('set-cookie', cookie);
    }
  } else {
    const singleCookie = upstream.headers.get('set-cookie');
    if (singleCookie) {
      response.headers.append('set-cookie', singleCookie);
    }
  }

  return response;
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
