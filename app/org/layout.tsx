import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchAuthProfile } from '@/lib/sso';
import { fetchOrgInfo } from '@/lib/org-server';
import OrgShell from '@/components/org/org-shell';

/**
 * Org-Admin portal guard + ERP shell.
 *
 * - Not logged in → redirect `/login`.
 * - Logged in but not an org ADMIN → redirect `/my-profile`.
 * - Org ADMIN → render the ERP-style shell (sidebar + content area).
 */
export default async function OrgLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const profile = await fetchAuthProfile(headerList.get('cookie'));

  if (!profile?.user) {
    redirect('/login');
  }

  if (profile.user.orgRole !== 'ADMIN') {
    redirect('/my-profile');
  }

  const org = await fetchOrgInfo();
  const orgName = org?.name ?? 'Organisasi';
  const orgSlug = org?.slug ?? 'organisasi';

  return (
    <OrgShell orgName={orgName} orgSlug={orgSlug}>
      {children}
    </OrgShell>
  );
}
