import { describe, expect, test, vi } from 'vitest';
import { fetchAuthState, getPostLoginRedirect, SSO_COOKIE_NAME } from '@/lib/sso';

describe('SSO helpers', () => {
  test('redirects admin to admin panel', () => {
    const redirect = getPostLoginRedirect({ role: 'ADMIN' });
    expect(redirect).toBe('/admin-tpc');
  });

  test('redirects user to profile', () => {
    const redirect = getPostLoginRedirect({ role: 'USER' });
    expect(redirect).toBe('/my-profile');
  });

  test('redirects missing user to login', () => {
    const redirect = getPostLoginRedirect(null);
    expect(redirect).toBe('/login');
  });

  test('fetchAuthState returns null without session cookie', async () => {
    const result = await fetchAuthState(null);
    expect(result).toBeNull();
  });

  test('fetchAuthState returns user, plan, usage when session valid', async () => {
    const originalFetch = global.fetch;
    process.env.AUTH_BASE_URL = 'http://localhost:3000';

    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          user: {
            id: 'user-1',
            email: 'user@taxindo.co.id',
            role: 'USER',
            plan: 'FREE',
          },
          plan: { allowedModels: [], limits: {}, remaining: {} },
          usage: { period: 'monthly', counts: {} },
        }),
        { status: 200 },
      ),
    );

    const result = await fetchAuthState(`${SSO_COOKIE_NAME}=session-token`);

    expect(result?.user?.email).toBe('user@taxindo.co.id');
    expect(result?.plan).toBeTruthy();
    expect(result?.usage).toBeTruthy();

    global.fetch = originalFetch;
  });
});
