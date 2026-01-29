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
    const users = await prisma.adminUser.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
