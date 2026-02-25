import { NextResponse } from 'next/server';
import { SSO_COOKIE_NAME, fetchAuthState, getBackendUrl, getFrontendUrl, getPostLoginRedirect } from '@/lib/sso';

export const runtime = 'nodejs';

/**
 * SSO Callback Endpoint
 *
 * After a user logs in at TPC-AI, they are redirected here with:
 *   GET /api/auth/sso/callback?sso_token=<sessionToken>&state=<optional>
 *
 * This endpoint:
 *   1. Validates the token by calling TPC-AI /api/auth/me
 *   2. Sets the tpc_session cookie for tpcweb's origin
 *   3. Redirects to the appropriate page based on user role
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('sso_token') ?? searchParams.get('token');
  const state = searchParams.get('state');

  // Resolve frontend base URL once (tunnel / custom domain aware)
  const frontendBase = await getFrontendUrl();

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing_token', frontendBase));
  }

  // Validate the token against TPC-AI backend
  const base = await getBackendUrl();
  const authState = await fetchAuthState(null, base, token);

  if (!authState?.user) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', frontendBase));
  }

  // Determine redirect destination
  let redirectTo: string;
  if (state) {
    // state could be a relative path the user was trying to access
    redirectTo = state.startsWith('/') ? state : `/${state}`;
  } else {
    redirectTo = getPostLoginRedirect(authState.user);
  }

  // Use the admin-configured frontend URL as the base so redirects go to the
  // correct origin (tunnel / custom domain) instead of localhost.
  const redirectUrl = new URL(redirectTo, frontendBase);
  const response = NextResponse.redirect(redirectUrl);

  // Set the session cookie on tpcweb's domain
  response.cookies.set(SSO_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
