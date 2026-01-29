import { POST } from '@/app/api/admin/login/route';
import { describe, expect, test } from 'vitest';

describe.sequential('admin login endpoint', () => {
  test('login endpoint is disabled for SSO', async () => {
    const req = new Request('http://localhost/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'bad@taxindo.co.id', password: 'bad' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(410);
  });
});
