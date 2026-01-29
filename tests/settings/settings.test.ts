import { afterAll, afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { SSO_COOKIE_NAME } from '@/lib/sso';
import { GET, PUT } from '@/app/api/admin/settings/route';

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

describe.sequential('admin settings', () => {
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
    await prisma.siteSetting.deleteMany({
      where: { key: { in: ['hero', 'features', 'featureDetails', 'faq', 'footer'] } },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('settings rejects missing admin token', async () => {
    const req = new Request('http://localhost/api/admin/settings');
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  test('settings returns defaults when authorized', async () => {
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
    const req = new Request('http://localhost/api/admin/settings', {
      headers: { cookie: `${SSO_COOKIE_NAME}=session-token` },
    });

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.settings).toBeTruthy();
    expect(body.settings.hero).toBeTruthy();
  });

  test('settings PUT stores values', async () => {
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
    const payload = {
      hero: { title: 'Custom Title', subtitle: 'Custom subtitle' },
    };
    const req = new Request('http://localhost/api/admin/settings', {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        cookie: `${SSO_COOKIE_NAME}=session-token`,
      },
      body: JSON.stringify(payload),
    });

    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.settings.hero.title).toBe('Custom Title');

    const record = await prisma.siteSetting.findUnique({ where: { key: 'hero' } });
    expect(record).toBeTruthy();
  });
});
