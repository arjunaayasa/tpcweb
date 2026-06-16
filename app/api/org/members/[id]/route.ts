import { relayOrg } from '@/lib/org-proxy';

export const runtime = 'nodejs';

/** Proxies `PATCH /api/org/members/:id` → enable/disable a member ({ isActive }). */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return relayOrg(request, `/api/org/members/${encodeURIComponent(id)}`, 'PATCH', true);
}

/** Proxies `DELETE /api/org/members/:id` → remove a member. */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return relayOrg(request, `/api/org/members/${encodeURIComponent(id)}`, 'DELETE');
}
