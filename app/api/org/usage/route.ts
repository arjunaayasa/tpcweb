import { relayOrg } from '@/lib/org-proxy';

export const runtime = 'nodejs';

/** Proxies `GET /api/org/usage` → pool usage + per-member usage for the dashboard. */
export async function GET(request: Request) {
  return relayOrg(request, '/api/org/usage', 'GET');
}
