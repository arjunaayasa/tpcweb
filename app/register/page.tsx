import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchAuthState, getPostLoginRedirect, getSSORegisterUrl } from '@/lib/sso';

export default async function RegisterPage() {
  const headerList = await headers();
  const authState = await fetchAuthState(headerList.get('cookie'));

  // Already logged in — go to appropriate page
  if (authState?.user) {
    redirect(getPostLoginRedirect(authState.user));
  }

  // Not logged in — redirect to TPC-AI register page with SSO params
  const ssoRegisterUrl = await getSSORegisterUrl();
  redirect(ssoRegisterUrl);
}
