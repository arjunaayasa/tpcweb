import { relayOrg } from '@/lib/org-proxy';

export const runtime = 'nodejs';

/** Proxies `GET /api/org` → org info (id, slug, name, seatLimit, seatsUsed, planExpiresAt). */
export async function GET(request: Request) {
  return relayOrg(request, '/api/org', 'GET');
}
