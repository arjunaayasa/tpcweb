import { relayOrg } from '@/lib/org-proxy';

export const runtime = 'nodejs';

/**
 * Proxies `PUT /api/org/members/:id/limits` → set per-member caps.
 * Body: { dailyLimit?: number | null, monthlyLimit?: number | null }.
 * A null value means "unlimited / bounded only by the org pool".
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return relayOrg(request, `/api/org/members/${encodeURIComponent(id)}/limits`, 'PUT', true);
}
