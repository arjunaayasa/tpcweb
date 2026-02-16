'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';

type LoginResponse = {
  user?: {
    role?: 'ADMIN' | 'USER';
  };
  redirectTo?: string | null;
  sessionToken?: string;
};

const getRoleRedirect = (role?: 'ADMIN' | 'USER') =>
  role === 'ADMIN' ? '/admin-tpc' : '/my-profile';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ssoParams = useMemo(() => {
    const appId = searchParams.get('app_id') ?? searchParams.get('appId');
    const redirectUri = searchParams.get('redirect_uri') ?? searchParams.get('redirectUri');
    const state = searchParams.get('state');
    return { appId, redirectUri, state };
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, string> = { email, password };
      if (ssoParams.appId) payload.appId = ssoParams.appId;
      if (ssoParams.redirectUri) payload.redirectUri = ssoParams.redirectUri;
      if (ssoParams.state) payload.state = ssoParams.state;

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = (await res.json()) as LoginResponse;

        // Store sessionToken for SSO with TPC-AI
        if (data.sessionToken) {
          localStorage.setItem('tpc_token', data.sessionToken);
        }

        const redirectTarget = data.redirectTo ?? getRoleRedirect(data.user?.role);
        router.replace(redirectTarget);
        return;
      }

      if (res.status === 502) {
        setError('Layanan autentikasi tidak tersedia. Coba lagi sebentar lagi.');
      } else if (res.status === 401) {
        setError('Email atau password salah.');
      } else if (res.status === 400) {
        setError('Permintaan tidak valid. Periksa kembali data Anda.');
      } else {
        setError('Login gagal. Silakan coba lagi.');
      }
    } catch {
      setError('Tidak bisa terhubung ke server. Coba lagi nanti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
        Email
        <input
          type="email"
          name="email"
          autoComplete="email"
          className="rounded-xl border border-primary/20 px-4 py-3 text-sm text-text-dark shadow-sm focus:border-secondary focus:outline-none"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
        Password
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          className="rounded-xl border border-primary/20 px-4 py-3 text-sm text-text-dark shadow-sm focus:border-secondary focus:outline-none"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Memproses...' : 'Masuk'}
      </button>
    </form>
  );
}
