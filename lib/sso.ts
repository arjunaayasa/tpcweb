export const SSO_COOKIE_NAME = 'tpc_session';

export const getAuthBaseOrLocal = () => {
  const envUrl = process.env.AUTH_BASE_URL;
  if (envUrl && (envUrl.startsWith('https://') || envUrl.startsWith('http://'))) {
    return envUrl;
  }
  return 'http://localhost:3000';
};

export const AUTH_BASE_URL = getAuthBaseOrLocal();

export const SSO_APP_ID = process.env.SSO_APP_ID ?? 'tpc-admin';
export const SSO_REDIRECT_URI =
  process.env.SSO_REDIRECT_URI ?? 'http://localhost:3001/login';

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  role: 'ADMIN' | 'USER';
  plan?: string | null;
  avatarUrl?: string | null;
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

export const getSSOLoginUrl = (state?: string) => {
  const url = new URL('/login', AUTH_BASE_URL);
  url.searchParams.set('app_id', SSO_APP_ID);
  url.searchParams.set('redirect_uri', SSO_REDIRECT_URI);
  if (state) {
    url.searchParams.set('state', state);
  }
  return url.toString();
};

export const getSSORegisterUrl = (state?: string) => {
  const url = new URL('/register', AUTH_BASE_URL);
  url.searchParams.set('app_id', SSO_APP_ID);
  url.searchParams.set('redirect_uri', SSO_REDIRECT_URI);
  if (state) {
    url.searchParams.set('state', state);
  }
  return url.toString();
};

export const getSSOLogoutUrl = () =>
  new URL('/api/auth/logout', AUTH_BASE_URL).toString();

export const fetchAuthMe = async (cookieHeader: string | null) => {
  const state = await fetchAuthState(cookieHeader);
  return state?.user ?? null;
};

export const fetchAuthState = async (cookieHeader: string | null) => {
  const session = getCookieValue(cookieHeader, SSO_COOKIE_NAME);
  if (!session) {
    return null;
  }

  const res = await fetch(`${AUTH_BASE_URL}/api/auth/me`, {
    headers: {
      cookie: `${SSO_COOKIE_NAME}=${encodeURIComponent(session)}`,
    },
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

export const fetchAuthProfile = async (cookieHeader: string | null) => {
  const session = getCookieValue(cookieHeader, SSO_COOKIE_NAME);
  if (!session) {
    return null;
  }

  const res = await fetch(`${AUTH_BASE_URL}/api/profile`, {
    headers: {
      cookie: `${SSO_COOKIE_NAME}=${encodeURIComponent(session)}`,
    },
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
  const state = await fetchAuthState(request.headers.get('cookie'));
  if (!state?.user || state.user.role !== 'ADMIN') {
    return null;
  }
  return state.user;
};
