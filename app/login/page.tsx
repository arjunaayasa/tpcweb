import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchAuthState, getPostLoginRedirect, getSSOLoginUrl } from '@/lib/sso';
import OrgLoginForm from './org-login-form';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const headerList = await headers();
  const authState = await fetchAuthState(headerList.get('cookie'));

  // Already logged in — go to appropriate page
  if (authState?.user) {
    redirect(getPostLoginRedirect(authState.user));
  }

  const params = await searchParams;
  const orgMode = params.org !== undefined;

  // Organization login mode — render the slug entry form (no auto-redirect).
  if (orgMode) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-light via-white to-neutral-light px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-primary/15 bg-white p-8 shadow-xl shadow-primary/5">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-text-dark">Login dengan Organisasi</h1>
            <p className="mt-2 text-sm text-text-dark/60">
              Masukkan slug organisasi Anda untuk masuk melalui subdomain organisasi.
            </p>
          </div>
          <OrgLoginForm />
        </div>
      </main>
    );
  }

  // Normal login — redirect to TPC-AI SSO with SSO params.
  // Organization login remains available at `/login?org=1`.
  const ssoLoginUrl = await getSSOLoginUrl();
  redirect(ssoLoginUrl);
}
