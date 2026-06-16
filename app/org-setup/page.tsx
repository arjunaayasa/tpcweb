import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { fetchAuthProfile } from '@/lib/sso';
import { getSiteSettings } from '@/lib/site-settings';
import OrgSetupClient from './org-setup-client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Aktifkan Portal Organisasi - TPC AI',
};

/**
 * No-payment organization setup for accounts that already hold the MNC/Group plan.
 *
 * - Not logged in → /login.
 * - Already an org ADMIN → /org (portal already active).
 * - Not on the MNC plan → /my-profile (must purchase MNC first).
 * - MNC plan without an org → render the setup form (provisions without re-charging).
 */
export default async function OrgSetupPage() {
  const headerList = await headers();
  const profile = await fetchAuthProfile(headerList.get('cookie'));

  if (!profile?.user) {
    redirect('/login');
  }

  const { user } = profile;

  if (user.orgRole === 'ADMIN') {
    redirect('/org');
  }
  if (user.plan !== 'MNC') {
    redirect('/my-profile');
  }

  const settings = await getSiteSettings(['footer']);

  return (
    <main className="min-h-screen flex flex-col bg-neutral-light text-text-dark">
      <Navbar />
      <div className="flex-1 pt-28">
        <OrgSetupClient />
      </div>
      <Footer settings={settings.footer} />
    </main>
  );
}
