import { relayOrg } from '@/lib/org-proxy';

export const runtime = 'nodejs';

/**
 * Proxies `POST /api/org/seats` → raise the org seat limit ({ addSeats }).
 * Called after a confirmed seat add-on payment. Authorized by the org ADMIN
 * session (cookie-forwarded); the backend validates the admin role.
 */
export async function POST(request: Request) {
  return relayOrg(request, '/api/org/seats', 'POST', true);
}
