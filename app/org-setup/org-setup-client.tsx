'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Status = 'idle' | 'provisioning' | 'success' | 'error';

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;

/**
 * Activates the MNC/Group organization portal for an already-paid account.
 *
 * Unlike `/checkout/organization`, there is NO payment step here — the account already holds the
 * MNC plan. It just collects a name + slug and provisions the org via `/api/org/provision`
 * (which is guarded server-side to require the MNC plan).
 */
export default function OrgSetupClient() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const slugValid = SLUG_RE.test(slug);
  const formValid = name.trim().length > 0 && slugValid;
  const isBusy = status === 'provisioning';

  const handleSubmit = async () => {
    if (!formValid || isBusy) return;
    setStatus('provisioning');
    setMessage('');

    try {
      const res = await fetch('/api/org/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ slug, name, interval: 'MONTHLY' }),
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.status === 409) {
        setStatus('error');
        setMessage(`Slug "${slug}" sudah digunakan. Silakan pilih slug lain.`);
        return;
      }
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus('error');
        setMessage(err.error ?? 'Gagal mengaktifkan portal organisasi.');
        return;
      }

      setStatus('success');
      setMessage(`Portal organisasi "${name}" aktif di ${slug}.taxindo.ai!`);
      setTimeout(() => router.push('/org'), 2500);
    } catch {
      setStatus('error');
      setMessage('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  return (
    <div className="flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <Link
          href="/my-profile"
          className="inline-flex items-center gap-1.5 text-text-dark/50 text-sm font-medium hover:text-primary transition-colors mb-6"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Profil
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-100/50 overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 md:px-8 py-6 text-white">
            <h1 className="text-xl font-bold tracking-tight">Aktifkan Portal Organisasi</h1>
            <p className="text-slate-300 text-sm mt-1">
              Paket MNC / Group Anda sudah aktif. Buat organisasi dan dapatkan subdomain khusus — tanpa biaya tambahan.
            </p>
          </div>

          <div className="px-6 md:px-8 py-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Organisasi</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="PT Contoh Sejahtera"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug Organisasi</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="contoh"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                {slug ? (
                  slugValid ? (
                    <>
                      Subdomain Anda: <span className="font-semibold text-primary">{slug}.taxindo.ai</span>
                    </>
                  ) : (
                    <span className="text-red-500">
                      Slug harus 3–32 karakter, huruf kecil/angka/tanda hubung, tidak diawali/diakhiri tanda hubung.
                    </span>
                  )
                ) : (
                  'Hanya huruf kecil, angka, dan tanda hubung. Contoh: contoh.taxindo.ai'
                )}
              </p>
            </div>

            {message ? (
              <div
                className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  status === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : status === 'error'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-slate-50 text-text-dark/60 border border-slate-200'
                }`}
              >
                {message}
              </div>
            ) : null}

            {status !== 'success' ? (
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!formValid || isBusy}
                className="w-full rounded-xl bg-slate-900 py-3.5 text-center text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBusy ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Mengaktifkan...
                  </span>
                ) : status === 'error' ? (
                  'Coba Lagi'
                ) : (
                  'Aktifkan Portal Organisasi'
                )}
              </button>
            ) : (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 mb-3">
                  <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-text-dark/50">Mengalihkan ke portal organisasi...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
