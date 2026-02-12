import { headers } from 'next/headers';
import { fetchAuthState } from '@/lib/sso';
import { getSiteSettings } from '@/lib/site-settings';
import NavbarClient from './navbar-client';

export default async function Navbar() {
  const headerList = await headers();
  const authState = await fetchAuthState(headerList.get('cookie'));
  const settings = await getSiteSettings(['redirects']);

  return <NavbarClient user={authState?.user ?? null} redirects={settings.redirects} />;
}
