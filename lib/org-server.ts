import { headers } from 'next/headers';
import { getBackendUrl } from '@/lib/sso';
import type { OrgInfo, OrgUsage } from '@/lib/org-types';

/**
 * Server-only Org-Admin fetch helpers.
 *
 * These import `next/headers` and therefore must only be used from Server Components / Route
 * Handlers. Pure types and constants live in `@/lib/org-types` (safe for client imports).
 */

/** Server-side fetch of `GET /api/org`, forwarding the SSO cookie. */
export async function fetchOrgInfo(): Promise<OrgInfo | null> {
  try {
    const headerList = await headers();
    const cookie = headerList.get('cookie') ?? '';
    const base = await getBackendUrl();
    const res = await fetch(`${base}/api/org`, {
      headers: { cookie, accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as OrgInfo;
  } catch {
    return null;
  }
}

/** Server-side fetch of `GET /api/org/usage`, forwarding the SSO cookie. */
export async function fetchOrgUsage(): Promise<OrgUsage | null> {
  try {
    const headerList = await headers();
    const cookie = headerList.get('cookie') ?? '';
    const base = await getBackendUrl();
    const res = await fetch(`${base}/api/org/usage`, {
      headers: { cookie, accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as OrgUsage;
  } catch {
    return null;
  }
}
