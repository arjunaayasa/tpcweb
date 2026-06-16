/**
 * Shared Org-Admin types and constants.
 *
 * This module is import-safe from BOTH client and server components — it must NOT import
 * server-only APIs (e.g. `next/headers`). Server-side fetch helpers live in `@/lib/org-server`.
 */

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
