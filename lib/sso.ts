export const SSO_COOKIE_NAME = 'tpc_session';

export const getAuthBaseOrLocal = () => {
  const envUrl = process.env.AUTH_BASE_URL;
  if (envUrl && (envUrl.startsWith('https://') || envUrl.startsWith('http://'))) {
    return envUrl;
  }
  return 'http://localhost:3000';
};

/** Static fallback — used when we cannot await the DB lookup. */
export const AUTH_BASE_URL = getAuthBaseOrLocal();

/**
 * Dynamic backend URL — checks the admin-configured `redirects.backendUrl`
 * in the DB first, then falls back to the environment variable / localhost.
 * Result is cached per-request via Next.js `fetch` de-duplication.
 */
export const getBackendUrl = async (): Promise<string> => {
  try {
    // Lazy-import to avoid circular dependency with prisma
    const { prisma } = await import('@/lib/prisma');
    const row = await prisma.siteSetting.findUnique({ where: { key: 'redirects' } });
    if (row && row.value && typeof row.value === 'object') {
      const val = row.value as Record<string, unknown>;
      const dbUrl = val.backendUrl as string | undefined;
      if (dbUrl && (dbUrl.startsWith('https://') || dbUrl.startsWith('http://'))) {
        return dbUrl;
      }
    }
  } catch {
    // DB not available — fall through
  }
  return AUTH_BASE_URL;
};

/**
 * Dynamic frontend URL — checks `redirects.frontendUrl` in the DB first,
 * falls back to the environment variable NEXT_PUBLIC_TPCWEB_URL / localhost.
 */
export const getFrontendUrl = async (): Promise<string> => {
  try {
    const { prisma } = await import('@/lib/prisma');
    const row = await prisma.siteSetting.findUnique({ where: { key: 'redirects' } });
    if (row && row.value && typeof row.value === 'object') {
      const val = row.value as Record<string, unknown>;
      const dbUrl = val.frontendUrl as string | undefined;
      if (dbUrl && (dbUrl.startsWith('https://') || dbUrl.startsWith('http://'))) {
        return dbUrl.replace(/\/+$/, '');
      }
    }
  } catch {
    // DB not available — fall through
  }
  return process.env.NEXT_PUBLIC_TPCWEB_URL ?? 'http://localhost:3001';
};

export const SSO_APP_ID = process.env.SSO_APP_ID ?? 'tpcweb';

/** Static fallback — used only when the DB lookup is unavailable. */
export const SSO_REDIRECT_URI =
  process.env.SSO_REDIRECT_URI ?? 'http://localhost:3001/api/auth/sso/callback';

/**
 * Dynamic SSO redirect URI — checks the admin-configured `redirects.frontendUrl`
 * in the DB first, appends `/api/auth/sso/callback`, then falls back to the
 * environment variable / localhost.
 */
export const getSsoRedirectUri = async (): Promise<string> => {
  try {
    const { prisma } = await import('@/lib/prisma');
    const row = await prisma.siteSetting.findUnique({ where: { key: 'redirects' } });
    if (row && row.value && typeof row.value === 'object') {
      const val = row.value as Record<string, unknown>;
      const dbUrl = val.frontendUrl as string | undefined;
      if (dbUrl && (dbUrl.startsWith('https://') || dbUrl.startsWith('http://'))) {
        // Strip trailing slash then append callback path
        return dbUrl.replace(/\/+$/, '') + '/api/auth/sso/callback';
      }
    }
  } catch {
    // DB not available — fall through
  }
  return SSO_REDIRECT_URI;
};

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  role: 'ADMIN' | 'USER';
  plan?: string | null;
  avatarUrl?: string | null;
  studentEligibleUntil?: string | null;
  organizationId?: string | null;
  orgRole?: 'ADMIN' | 'MEMBER' | null;
};

type PlanInfo = {
  allowedModels?: string[];
  limits?: Record<string, number>;
  remaining?: Record<string, number | null>;
};

type UsageInfo = {
  period?: string;
  counts?: Record<string, number>;
};

type AuthMeResponse = {
  user?: AuthUser;
  plan?: PlanInfo;
  usage?: UsageInfo;
};

export type AuthProfileUser = AuthUser & {
  createdAt?: string;
  updatedAt?: string;
};


type AuthProfileResponse = {
  user?: AuthProfileUser;
  plan?: PlanInfo;
  usage?: UsageInfo;
};

const getCookieValue = (cookieHeader: string | null, name: string) => {
  if (!cookieHeader) {
    return undefined;
  }

  for (const cookie of cookieHeader.split(';')) {
    const [key, ...rest] = cookie.trim().split('=');
    if (key === name) {
      try {
        return decodeURIComponent(rest.join('='));
      } catch {
        return undefined;
      }
    }
  }

  return undefined;
};

export const getSSOLoginUrl = async (state?: string) => {
  const base = await getBackendUrl();
  const redirectUri = await getSsoRedirectUri();
  const url = new URL('/login', base);
  url.searchParams.set('app_id', SSO_APP_ID);
  url.searchParams.set('redirect_uri', redirectUri);
  if (state) {
    url.searchParams.set('state', state);
  }
  return url.toString();
};

export const getSSORegisterUrl = async (state?: string) => {
  const base = await getBackendUrl();
  const redirectUri = await getSsoRedirectUri();
  const url = new URL('/register', base);
  url.searchParams.set('app_id', SSO_APP_ID);
  url.searchParams.set('redirect_uri', redirectUri);
  if (state) {
    url.searchParams.set('state', state);
  }
  return url.toString();
};

export const getSSOLogoutUrl = async () => {
  const base = await getBackendUrl();
  return new URL('/api/auth/logout', base).toString();
};

export const fetchAuthMe = async (cookieHeader: string | null, baseUrl?: string, token?: string) => {
  const state = await fetchAuthState(cookieHeader, baseUrl, token);
  return state?.user ?? null;
};

export const fetchAuthState = async (cookieHeader: string | null, baseUrl?: string, token?: string) => {
  let session = token;
  if (!session) {
    session = getCookieValue(cookieHeader, SSO_COOKIE_NAME);
  }

  if (!session) {
    return null;
  }

  const base = baseUrl ?? await getBackendUrl();

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['cookie'] = `${SSO_COOKIE_NAME}=${encodeURIComponent(session)}`;
  }

  const res = await fetch(`${base}/api/auth/me`, {
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as AuthMeResponse;
  return {
    user: data.user ?? null,
    plan: data.plan ?? null,
    usage: data.usage ?? null,
  };
};

export const fetchAuthProfile = async (cookieHeader: string | null, token?: string) => {
  let session = token;
  if (!session) {
    session = getCookieValue(cookieHeader, SSO_COOKIE_NAME);
  }

  if (!session) {
    return null;
  }

  const base = await getBackendUrl();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['cookie'] = `${SSO_COOKIE_NAME}=${encodeURIComponent(session)}`;
  }

  const res = await fetch(`${base}/api/profile`, {
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as AuthProfileResponse;
  return {
    user: data.user ?? null,
    plan: data.plan ?? null,
    usage: data.usage ?? null,
  };
};

export const getPostLoginRedirect = (user: AuthUser | null) => {
  if (!user) {
    return '/login';
  }
  return user.role === 'ADMIN' ? '/admin-tpc' : '/my-profile';
};

export const requireAdminFromRequest = async (request: Request) => {
  const cookie = request.headers.get('cookie');
  const authHeader = request.headers.get('authorization');
  let token: string | undefined;

  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    token = authHeader.substring(7);
  }

  const state = await fetchAuthState(cookie, undefined, token);
  if (!state?.user || state.user.role !== 'ADMIN') {
    return null;
  }
  return state.user;
};
