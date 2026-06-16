'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

declare global {
    interface Window {
        snap?: {
            pay: (
                token: string,
                options: {
                    onSuccess?: (result: Record<string, unknown>) => void;
                    onPending?: (result: Record<string, unknown>) => void;
                    onError?: (result: Record<string, unknown>) => void;
                    onClose?: () => void;
                },
            ) => void;
        };
    }
}

type Interval = 'MONTHLY' | 'YEARLY';

type Status =
    | 'idle'
    | 'loading-price'
    | 'ready'
    | 'creating'
    | 'paying'
    | 'verifying'
    | 'provisioning'
    | 'success'
    | 'pending'
    | 'error';

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function OrganizationCheckoutClient() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [interval, setInterval] = useState<Interval>('MONTHLY');

    const [status, setStatus] = useState<Status>('idle');
    const [message, setMessage] = useState('');
    const [price, setPrice] = useState<number | null>(null);

    const snapLoaded = useRef(false);
    const statusRef = useRef<Status>('idle');

    const updateStatus = (s: Status) => {
        statusRef.current = s;
        setStatus(s);
    };

    // Load Midtrans Snap.js
    useEffect(() => {
        void (async () => {
            try {
                const res = await fetch('/api/public/midtrans-config');
                if (res.ok) {
                    const data = (await res.json()) as { clientKey: string; isProduction: boolean };
                    const key = data.clientKey || process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
                    const snapUrl = data.isProduction
                        ? 'https://app.midtrans.com/snap/snap.js'
                        : 'https://app.sandbox.midtrans.com/snap/snap.js';
                    if (snapLoaded.current || !key) return;
                    const existing = document.querySelector(`script[src*="snap.js"]`);
                    if (existing) { snapLoaded.current = true; return; }
                    const script = document.createElement('script');
                    script.src = snapUrl;
                    script.setAttribute('data-client-key', key);
                    script.async = true;
                    script.onload = () => { snapLoaded.current = true; };
                    document.head.appendChild(script);
                }
            } catch { /* env fallback */ }
        })();
    }, []);

    // Fetch MNC price for the selected interval
    useEffect(() => {
        updateStatus('loading-price');
        void (async () => {
            try {
                const res = await fetch(`/api/public/plan-prices?plan=MNC&interval=${interval}`);
                let pPrice: number | null = null;
                if (res.ok) {
                    const data = (await res.json()) as { prices: Array<{ amount: number }> };
                    pPrice = data.prices?.[0]?.amount ?? null;
                }
                if (pPrice !== null && pPrice > 0) {
                    setPrice(pPrice);
                    updateStatus('ready');
                } else {
                    setPrice(null);
                    updateStatus('ready');
                }
            } catch {
                updateStatus('error');
                setMessage('Terjadi kesalahan saat memuat harga.');
            }
        })();
    }, [interval]);

    const slugValid = SLUG_RE.test(slug);
    const formValid = name.trim().length > 0 && slugValid;

    const handlePay = useCallback(async () => {
        if (statusRef.current !== 'ready' && statusRef.current !== 'error' && statusRef.current !== 'pending') return;
        if (!formValid) {
            setMessage('Lengkapi nama organisasi dan slug yang valid terlebih dahulu.');
            updateStatus('error');
            return;
        }
        if (!price) {
            setMessage('Harga paket MNC belum tersedia. Silakan hubungi kami.');
            updateStatus('error');
            return;
        }

        updateStatus('creating');
        setMessage('');

        try {
            const createRes = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ type: 'plan', plan: 'MNC', interval }),
            });

            if (createRes.status === 401) {
                router.push('/login');
                return;
            }
            if (!createRes.ok) {
                const err = (await createRes.json()) as { error?: string };
                updateStatus('error');
                setMessage(err.error ?? 'Gagal membuat transaksi.');
                return;
            }

            const { token, order_id } = (await createRes.json()) as { token: string; order_id: string };

            if (!window.snap) {
                updateStatus('error');
                setMessage('Payment gateway belum siap. Coba refresh halaman.');
                return;
            }

            updateStatus('paying');

            window.snap.pay(token, {
                onSuccess: async () => {
                    updateStatus('verifying');
                    try {
                        // 1. Verify the MNC payment & upgrade the buyer's plan.
                        const verifyRes = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ order_id, plan: 'MNC', type: 'plan' }),
                        });
                        if (!verifyRes.ok) {
                            updateStatus('error');
                            setMessage('Pembayaran berhasil, namun verifikasi gagal. Hubungi dukungan.');
                            return;
                        }

                        // 2. Provision the organization (server-to-server, billing key).
                        updateStatus('provisioning');
                        const provisionRes = await fetch('/api/org/provision', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ slug, name, interval }),
                        });

                        if (provisionRes.status === 409) {
                            updateStatus('error');
                            setMessage(`Slug "${slug}" sudah digunakan. Pembayaran berhasil — hubungi dukungan untuk menetapkan slug lain.`);
                            return;
                        }
                        if (!provisionRes.ok) {
                            const err = (await provisionRes.json().catch(() => ({}))) as { error?: string };
                            updateStatus('error');
                            setMessage(err.error ?? 'Pembayaran berhasil, namun gagal membuat organisasi. Hubungi dukungan.');
                            return;
                        }

                        updateStatus('success');
                        setMessage(`Organisasi "${name}" berhasil dibuat di ${slug}.taxindo.ai!`);
                        setTimeout(() => router.push('/my-profile/subscriptions'), 3500);
                    } catch {
                        updateStatus('error');
                        setMessage('Pembayaran berhasil, namun terjadi kesalahan saat membuat organisasi. Hubungi dukungan.');
                    }
                },
                onPending: () => {
                    updateStatus('pending');
                    setMessage('Pembayaran menunggu konfirmasi. Selesaikan pembayaran Anda.');
                },
                onError: () => {
                    updateStatus('error');
                    setMessage('Pembayaran gagal. Silakan coba lagi.');
                },
                onClose: () => {
                    if (statusRef.current !== 'success') {
                        updateStatus('ready');
                        setMessage('Pembayaran dibatalkan.');
                    }
                },
            });
        } catch {
            updateStatus('error');
            setMessage('Terjadi kesalahan. Silakan coba lagi.');
        }
    }, [formValid, price, interval, slug, name, router]);

    const isProcessing =
        status === 'creating' || status === 'paying' || status === 'verifying' || status === 'provisioning';

    return (
        <div className="min-h-[80vh] flex items-start justify-center px-4 py-16">
            <div className="w-full max-w-2xl">
                <Link href="/pricing" className="inline-flex items-center gap-1.5 text-text-dark/50 text-sm font-medium hover:text-primary transition-colors mb-6">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Kembali ke Harga
                </Link>

                <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-100/50 overflow-hidden">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 md:px-8 py-6 text-white">
                        <h1 className="text-xl font-bold tracking-tight">Buat Organisasi MNC / Group</h1>
                        <p className="text-slate-300 text-sm mt-1">
                            Daftarkan organisasi Anda dan dapatkan subdomain khusus.
                        </p>
                    </div>

                    <div className="px-6 md:px-8 py-6 space-y-5">
                        {/* Org name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Nama Organisasi
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="PT Contoh Sejahtera"
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none"
                            />
                        </div>

                        {/* Org slug */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Slug Organisasi
                            </label>
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

                        {/* Interval */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Periode Langganan</label>
                            <div className="flex rounded-full bg-slate-100 p-1 w-fit">
                                <button
                                    type="button"
                                    onClick={() => setInterval('MONTHLY')}
                                    className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${interval === 'MONTHLY' ? 'bg-primary text-white shadow' : 'text-text-dark/60'}`}
                                >
                                    Bulanan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setInterval('YEARLY')}
                                    className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${interval === 'YEARLY' ? 'bg-primary text-white shadow' : 'text-text-dark/60'}`}
                                >
                                    Tahunan
                                </button>
                            </div>
                        </div>

                        {/* Price summary */}
                        <div className="rounded-2xl bg-slate-50 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-700">Total</span>
                                {status === 'loading-price' ? (
                                    <span className="inline-block w-24 h-5 bg-gray-200 rounded animate-pulse" />
                                ) : price !== null ? (
                                    <span className="text-lg font-bold text-primary">
                                        {formatCurrency(price)}
                                        <span className="text-xs font-normal text-gray-500"> / {interval === 'MONTHLY' ? 'bulan' : 'tahun'}</span>
                                    </span>
                                ) : (
                                    <span className="text-sm text-gray-500">Hubungi Kami</span>
                                )}
                            </div>
                        </div>

                        {/* Message */}
                        {message ? (
                            <div className={`rounded-xl px-4 py-3 text-sm font-medium ${status === 'success'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : status === 'pending'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : status === 'error'
                                        ? 'bg-red-50 text-red-700 border border-red-200'
                                        : 'bg-slate-50 text-text-dark/60 border border-slate-200'
                                }`}>
                                {message}
                            </div>
                        ) : null}

                        {/* CTA */}
                        {status !== 'success' ? (
                            <button
                                type="button"
                                onClick={() => void handlePay()}
                                disabled={!formValid || isProcessing || price === null}
                                className="w-full rounded-xl bg-slate-900 py-3.5 text-center text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <span className="inline-flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        {status === 'creating' ? 'Menyiapkan...'
                                            : status === 'verifying' ? 'Memverifikasi...'
                                                : status === 'provisioning' ? 'Membuat organisasi...'
                                                    : 'Menunggu pembayaran...'}
                                    </span>
                                ) : status === 'error' || status === 'pending' ? (
                                    'Coba Lagi'
                                ) : (
                                    'Bayar & Buat Organisasi'
                                )}
                            </button>
                        ) : (
                            <div className="text-center py-4">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 mb-3">
                                    <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-sm text-text-dark/50">Mengalihkan ke halaman langganan...</p>
                            </div>
                        )}

                        <div className="flex items-center gap-2 justify-center text-[11px] text-text-dark/30">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Pembayaran aman oleh Midtrans
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
