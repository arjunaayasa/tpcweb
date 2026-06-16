'use client';

import Link from 'next/link';
import type { FormEvent } from 'react';
import { useState } from 'react';

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;

/**
 * "Login with Organization" — the user enters their organization slug and is
 * redirected to the org subdomain SSO entry point `https://{slug}.taxindo.ai/login`,
 * where the standard SSO flow runs and binds the session to that organization.
 */
export default function OrgLoginForm() {
    const [slug, setSlug] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const normalized = slug.trim().toLowerCase();
        if (!SLUG_RE.test(normalized)) {
            setError('Slug tidak valid. Gunakan 3–32 karakter: huruf kecil, angka, atau tanda hubung.');
            return;
        }
        setError(null);
        // Navigate to the organization subdomain SSO entry point.
        window.location.href = `https://${normalized}.taxindo.ai/login`;
    };

    return (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium text-text-dark">
                Slug Organisasi
                <div className="flex items-center rounded-xl border border-primary/20 shadow-sm focus-within:border-secondary overflow-hidden">
                    <input
                        type="text"
                        name="orgSlug"
                        autoComplete="off"
                        placeholder="organisasi-anda"
                        className="flex-1 px-4 py-3 text-sm text-text-dark focus:outline-none"
                        value={slug}
                        onChange={(event) => {
                            setSlug(event.target.value.toLowerCase());
                            if (error) setError(null);
                        }}
                    />
                    <span className="px-3 text-xs text-text-dark/50 bg-slate-50 self-stretch flex items-center">
                        .taxindo.ai
                    </span>
                </div>
            </label>
            {slug.trim() && SLUG_RE.test(slug.trim().toLowerCase()) ? (
                <p className="text-xs text-text-dark/50">
                    Anda akan diarahkan ke{' '}
                    <span className="font-semibold text-primary">{slug.trim().toLowerCase()}.taxindo.ai</span>
                </p>
            ) : null}
            {error ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
                    {error}
                </p>
            ) : null}
            <button
                type="submit"
                className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-secondary"
            >
                Lanjutkan ke Organisasi
            </button>
            <Link
                href="/login"
                className="text-center text-xs font-medium text-text-dark/50 hover:text-primary transition"
            >
                ← Kembali ke login biasa
            </Link>
        </form>
    );
}
