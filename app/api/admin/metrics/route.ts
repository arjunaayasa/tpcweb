import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/sso';

const unauthorizedResponse = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function GET(request: Request) {
  const admin = await requireAdminFromRequest(request);
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    const metric = await prisma.metric.findUnique({
      where: { key: 'total_visits' },
    });

    return NextResponse.json({ totalVisits: metric?.value ?? 0 });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
