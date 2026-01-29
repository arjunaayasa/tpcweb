import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TRACK_COOKIE = 'tpc_visit';

const getCookieValue = (cookieHeader: string | null, name: string) => {
  if (!cookieHeader) {
    return undefined;
  }

  for (const cookie of cookieHeader.split(';')) {
    const [key, ...rest] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return undefined;
};

export async function POST(request: Request) {
  try {
    const existing = getCookieValue(request.headers.get('cookie'), TRACK_COOKIE);
    const metric = await prisma.metric.findUnique({ where: { key: 'total_visits' } });

    if (existing) {
      return NextResponse.json({ ok: true, totalVisits: metric?.value ?? 0 });
    }

    const updated = await prisma.metric.upsert({
      where: { key: 'total_visits' },
      update: { value: { increment: 1 } },
      create: { key: 'total_visits', value: 1 },
    });

    const response = NextResponse.json({ ok: true, totalVisits: updated.value });
    response.cookies.set(TRACK_COOKIE, '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 12,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
