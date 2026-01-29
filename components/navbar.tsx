import { headers } from 'next/headers';
import { fetchAuthState } from '@/lib/sso';
import NavbarClient from './navbar-client';

export default async function Navbar() {
  const headerList = await headers();
  const authState = await fetchAuthState(headerList.get('cookie'));

  return <NavbarClient user={authState?.user ?? null} />;
}
