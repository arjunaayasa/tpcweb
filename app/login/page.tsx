import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchAuthState, getPostLoginRedirect, getSSOLoginUrl } from '@/lib/sso';

export default async function LoginPage() {
  const headerList = await headers();
  const authState = await fetchAuthState(headerList.get('cookie'));

  // Already logged in — go to appropriate page
  if (authState?.user) {
    redirect(getPostLoginRedirect(authState.user));
  }

  // Not logged in — redirect to TPC-AI login with SSO params
  const ssoLoginUrl = await getSSOLoginUrl();
  redirect(ssoLoginUrl);
}
