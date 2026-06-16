import { redirect } from 'next/navigation';
import { getBackendUrl } from '@/lib/sso';

export const dynamic = 'force-dynamic';

/**
 * Catch-all for legacy admin sub-routes (e.g. /admin-tpc/users, /admin-tpc/settings/midtrans).
 * All of them now forward to the single portal admin at `<portal>/admin`.
 */
export default async function LegacyAdminRedirect() {
  const base = (await getBackendUrl()).replace(/\/+$/, '');
  redirect(`${base}/admin`);
}
