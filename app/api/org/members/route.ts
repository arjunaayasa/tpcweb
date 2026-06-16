import { relayOrg } from '@/lib/org-proxy';

export const runtime = 'nodejs';

/**
 * Proxies `POST /api/org/members` → create a member (email/password/name).
 * Backend enforces the seat check and returns 409 SEAT_LIMIT_REACHED.
 */
export async function POST(request: Request) {
  return relayOrg(request, '/api/org/members', 'POST', true);
}
