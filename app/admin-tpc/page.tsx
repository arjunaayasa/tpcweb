import { redirect } from 'next/navigation';
import { getBackendUrl } from '@/lib/sso';

export const dynamic = 'force-dynamic';

/**
 * The admin panel now lives entirely on the portal (tpc-ai) at `<portal>/admin`. tpcweb no longer
 * has its own admin UI — this route just forwards to the portal admin. The portal URL is resolved
 * from the admin-configured `redirects.backendUrl` (or env fallback) via `getBackendUrl()`.
 */
export default async function AdminRedirect() {
  const base = (await getBackendUrl()).replace(/\/+$/, '');
  redirect(`${base}/admin`);
}
