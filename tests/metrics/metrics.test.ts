import { afterAll, afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { SSO_COOKIE_NAME } from '@/lib/sso';
import { GET } from '@/app/api/admin/metrics/route';
import { POST } from '@/app/api/track/route';

const prisma = new PrismaClient();

const snapshotEnv = () => ({ ...process.env });

const restoreEnv = (snapshot: NodeJS.ProcessEnv) => {
  for (const key of Object.keys(process.env)) {
    if (!(key in snapshot)) {
      delete process.env[key];
    }
  }
  Object.assign(process.env, snapshot);
};

describe.sequential('admin metrics', () => {
  const envSnapshot = snapshotEnv();
  const originalFetch = global.fetch;

  beforeEach(() => {
    restoreEnv(envSnapshot);
    process.env.AUTH_BASE_URL = 'http://localhost:3000';
    global.fetch = originalFetch;
  });

  afterEach(async () => {
    restoreEnv(envSnapshot);
    global.fetch = originalFetch;
    await prisma.metric.delete({ where: { key: 'total_visits' } }).catch(() => undefined);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('metrics rejects missing admin token', async () => {
    const req = new Request('http://localhost/api/admin/metrics');
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  test('metrics rejects invalid admin token', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }));
    const req = new Request('http://localhost/api/admin/metrics', {
      headers: { cookie: `${SSO_COOKIE_NAME}=bad-token` },
    });

    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  test('metrics returns total visits when authorized', async () => {
    await prisma.metric.create({ data: { key: 'total_visits', value: 7 } });
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          user: {
            id: 'admin-id',
            email: 'admin@taxindo.co.id',
            role: 'ADMIN',
            plan: 'FREE',
          },
        }),
        { status: 200 },
      ),
    );
    const req = new Request('http://localhost/api/admin/metrics', {
      headers: { cookie: `${SSO_COOKIE_NAME}=session-token` },
    });

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ totalVisits: 7 });
  });

  test('track increments total visits', async () => {
    await prisma.metric.create({ data: { key: 'total_visits', value: 3 } });
    const req = new Request('http://localhost/api/track', { method: 'POST' });

    const res = await POST(req);

    const metric = await prisma.metric.findUnique({ where: { key: 'total_visits' } });

    expect(res.status).toBe(200);
    expect(metric?.value).toBe(4);
  });

  test('track initializes total visits when missing', async () => {
    const req = new Request('http://localhost/api/track', { method: 'POST' });

    await POST(req);

    const metric = await prisma.metric.findUnique({ where: { key: 'total_visits' } });

    expect(metric?.value).toBe(1);
  });
});
