import { afterAll, afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { SSO_COOKIE_NAME } from '@/lib/sso';
import { POST } from '@/app/api/admin/testimonials/route';
import { DEFAULT_TESTIMONIAL_PHOTO_URL } from '@/lib/testimonials';

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

describe.sequential('admin testimonials', () => {
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
    await prisma.testimonial.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('create testimonial rejects missing admin token', async () => {
    const req = new Request('http://localhost/api/admin/testimonials', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ quote: 'x', name: 'y', role: 'z', company: 'c', photoUrl: '/x.png' }),
    });

    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  test('create testimonial stores provided photo', async () => {
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
    const req = new Request('http://localhost/api/admin/testimonials', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `${SSO_COOKIE_NAME}=session-token`,
      },
      body: JSON.stringify({ quote: 'x', name: 'y', role: 'z', company: 'c', photoUrl: '/x.png' }),
    });

    const res = await POST(req);
    const record = await prisma.testimonial.findFirst({ where: { name: 'y' } });

    expect(res.status).toBe(201);
    expect(record?.photoUrl).toBe('/x.png');
  });

  test('create testimonial defaults missing photoUrl', async () => {
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
    const req = new Request('http://localhost/api/admin/testimonials', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `${SSO_COOKIE_NAME}=session-token`,
      },
      body: JSON.stringify({ quote: 'q', name: 'n', role: 'r', company: 'c' }),
    });

    const res = await POST(req);
    const record = await prisma.testimonial.findFirst({ where: { name: 'n' } });

    expect(res.status).toBe(201);
    expect(record?.photoUrl).toBe(DEFAULT_TESTIMONIAL_PHOTO_URL);
  });
});
