import { headers } from 'next/headers';
import { getBackendUrl } from '@/lib/sso';

/** Org info from `GET /api/org`. */
export type OrgInfo = {
  id: string;
  slug: string;
  name: string;
  seatLimit: number;
  seatsUsed: number;
  planExpiresAt: string | null;
};

/** A single period counter (daily / monthly). */
export type UsagePeriod = {
  daily: number;
  monthly: number;
};

/** Per-member caps; null means "unlimited / org-pool only". */
export type MemberLimits = {
  dailyLimit: number | null;
  monthlyLimit: number | null;
};

/** A member row from `GET /api/org/usage`. */
export type OrgMember = {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  orgRole: 'ADMIN' | 'MEMBER';
  usage: UsagePeriod;
  limits: MemberLimits;
};

/** Aggregate usage from `GET /api/org/usage`. */
export type OrgUsage = {
  period: UsagePeriod;
  pool: UsagePeriod;
  seatsUsed: number;
  members: OrgMember[];
};

/** Seat add-on price: Rp 150.000 / seat / month. */
export const SEAT_PRICE_PER_MONTH = 150000;

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
