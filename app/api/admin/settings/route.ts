import type { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SETTINGS, getSiteSettings, SiteSettingsKey } from '@/lib/site-settings';
import { requireAdminFromRequest } from '@/lib/sso';

const unauthorizedResponse = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

const badRequestResponse = (message: string) =>
  NextResponse.json({ error: message }, { status: 400 });

const isSameOrigin = (request: Request) => {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (!origin || !host) {
    return true;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};

const ensureSameOrigin = (request: Request) => {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const requireAdmin = async (request: Request) => {
  const admin = await requireAdminFromRequest(request);
  if (!admin) {
    return unauthorizedResponse();
  }
  return null;
};

export async function GET(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) {
    return authError;
  }

  try {
    const settings = await getSiteSettings();
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const originError = ensureSameOrigin(request);
  if (originError) {
    return originError;
  }

  const authError = await requireAdmin(request);
  if (authError) {
    return authError;
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return badRequestResponse('Invalid payload');
  }

  if (!payload || typeof payload !== 'object') {
    return badRequestResponse('Invalid payload');
  }

  const keys = Object.keys(DEFAULT_SETTINGS) as SiteSettingsKey[];
  const invalidKeys: SiteSettingsKey[] = [];
  const updates: Prisma.PrismaPromise<unknown>[] = [];

  for (const key of keys) {
    if (payload[key] === undefined) {
      continue;
    }

    if (!isPlainObject(payload[key])) {
      invalidKeys.push(key);
      continue;
    }

    const value = payload[key] as Prisma.InputJsonValue;
    updates.push(
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    );
  }
  if (invalidKeys.length > 0) {
    return badRequestResponse(`Invalid settings for: ${invalidKeys.join(', ')}`);
  }

  try {
    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    const settings = await getSiteSettings();
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
