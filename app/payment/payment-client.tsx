'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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

const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '';
const IS_PRODUCTION = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
const SNAP_JS_URL = IS_PRODUCTION
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';

const planLabels: Record<string, string> = {
    FREE: 'Free',
    BASIC: 'Basic',
    PLUS: 'Plus',
    MAX: 'Max',
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

type Status = 'idle' | 'loading-price' | 'ready' | 'creating' | 'paying' | 'verifying' | 'success' | 'pending' | 'error';

export default function PaymentClient() {
    const params = useSearchParams();
    const router = useRouter();
    const plan = params.get('plan') ?? '';
    const interval = (params.get('interval') ?? 'MONTHLY') as 'MONTHLY' | 'YEARLY';

    const [status, setStatus] = useState<Status>('idle');
    const [message, setMessage] = useState('');
    const [price, setPrice] = useState<number | null>(null);
    const [invoiceId, setInvoiceId] = useState<string | null>(null);
    const snapLoaded = useRef(false);
    const statusRef = useRef<Status>('idle');

    const updateStatus = (s: Status) => {
        statusRef.current = s;
        setStatus(s);
    };

    // Load Snap.js
    useEffect(() => {
        if (snapLoaded.current || !MIDTRANS_CLIENT_KEY) return;
        const existing = document.querySelector(`script[src*="snap.js"]`);
        if (existing) { snapLoaded.current = true; return; }

        const script = document.createElement('script');
        script.src = SNAP_JS_URL;
        script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
        script.async = true;
        script.onload = () => { snapLoaded.current = true; };
        document.head.appendChild(script);
    }, []);

    // Fetch price
    useEffect(() => {
        if (!plan) return;
        updateStatus('loading-price');

        const load = async () => {
            try {
                const res = await fetch(`/api/public/plan-prices?plan=${plan}&interval=${interval}`);
                if (res.ok) {
                    const data = (await res.json()) as { prices: Array<{ amount: number }> };
                    const matched = data.prices?.[0];
                    if (matched) {
                        setPrice(matched.amount);
                        updateStatus('ready');
                    } else {
                        updateStatus('error');
                        setMessage('Harga untuk paket ini belum tersedia.');
                    }
                } else {
                    updateStatus('error');
                    setMessage('Gagal memuat harga.');
                }
            } catch {
                updateStatus('error');
                setMessage('Terjadi kesalahan saat memuat harga.');
            }
        };
        void load();
    }, [plan, interval]);

    const handlePay = useCallback(async () => {
        if (statusRef.current !== 'ready' || !price) return;
        updateStatus('creating');
        setMessage('');

        try {
            const createRes = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ plan, interval }),
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
                        const verifyRes = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ order_id, plan }),
                        });
                        const verifyData = (await verifyRes.json()) as { invoiceId?: string };
                        if (verifyRes.ok) {
                            updateStatus('success');
                            setMessage(`Paket Anda berhasil diupgrade ke ${planLabels[plan] ?? plan}!`);
                            if (verifyData.invoiceId) {
                                setInvoiceId(verifyData.invoiceId);
                                setTimeout(() => router.push(`/invoice/${verifyData.invoiceId}`), 3000);
                            } else {
                                setTimeout(() => router.push('/my-profile/subscriptions'), 3000);
                            }
                        } else {
                            updateStatus('success');
                            setMessage('Pembayaran berhasil! Paket akan diperbarui segera.');
                            setTimeout(() => router.push('/my-profile/subscriptions'), 3000);
                        }
                    } catch {
                        updateStatus('success');
                        setMessage('Pembayaran berhasil! Paket akan diperbarui segera.');
                        setTimeout(() => router.push('/my-profile/subscriptions'), 3000);
                    }
                },
                onPending: () => {
                    updateStatus('pending');
                    setMessage('Pembayaran menunggu konfirmasi. Silakan selesaikan pembayaran Anda.');
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
    }, [plan, interval, price, router]);

    if (!plan) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-text-dark/60 mb-4">Paket tidak ditemukan.</p>
                    <Link href="/pricing" className="text-primary font-semibold hover:underline">
                        ← Kembali ke Harga
                    </Link>
                </div>
            </div>
        );
    }

    const isProcessing = status === 'creating' || status === 'paying' || status === 'verifying';
    const today = new Date();
    const formattedDate = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const dueDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="min-h-[80vh] flex items-start justify-center px-4 py-16">
            <div className="w-full max-w-5xl">
                {/* Back Link */}
                <Link href="/pricing" className="inline-flex items-center gap-1.5 text-text-dark/50 text-sm font-medium hover:text-primary transition-colors mb-6">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Kembali ke Harga
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
                    {/* Left: Proforma Invoice */}
                    <div className="lg:col-span-3">
                        <div className="rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-100/50 overflow-hidden">
                            {/* Invoice Header */}
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-8 py-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-xl font-bold tracking-tight">Proforma Invoice</h1>
                                        <p className="text-gray-400 text-sm mt-1">Ringkasan pesanan Anda</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300">
                                            Menunggu Pembayaran
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-6">
                                {/* Billing Info */}
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-1">Dari</p>
                                        <p className="text-sm font-bold text-gray-900">PT TaxPrime</p>
                                        <p className="text-xs text-gray-500">support@taxindo.ai</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-1">Tanggal</p>
                                        <p className="text-sm text-gray-900">{formattedDate}</p>
                                        <p className="text-xs text-gray-500">Jatuh tempo: {dueDate}</p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 my-4" />

                                {/* Items Table */}
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-semibold">
                                            <th className="text-left py-3">Deskripsi</th>
                                            <th className="text-center py-3">Qty</th>
                                            <th className="text-right py-3">Harga</th>
                                            <th className="text-right py-3">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-t border-gray-100">
                                        <tr>
                                            <td className="py-4">
                                                <p className="font-semibold text-gray-900">Paket {planLabels[plan] ?? plan}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Langganan {interval === 'MONTHLY' ? 'Bulanan' : 'Tahunan'}
                                                </p>
                                            </td>
                                            <td className="py-4 text-center text-gray-600">1</td>
                                            <td className="py-4 text-right text-gray-600">
                                                {status === 'loading-price' ? (
                                                    <span className="inline-block w-16 h-4 bg-gray-100 rounded animate-pulse" />
                                                ) : price !== null ? formatCurrency(price) : '-'}
                                            </td>
                                            <td className="py-4 text-right font-semibold text-gray-900">
                                                {status === 'loading-price' ? (
                                                    <span className="inline-block w-20 h-4 bg-gray-100 rounded animate-pulse" />
                                                ) : price !== null ? formatCurrency(price) : '-'}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="border-t border-gray-100" />

                                {/* Totals */}
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Subtotal</span>
                                        <span>{price !== null ? formatCurrency(price) : '-'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Pajak</span>
                                        <span>Rp 0</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                                        <span className="font-bold text-gray-900">Total</span>
                                        {status === 'loading-price' ? (
                                            <span className="inline-block w-24 h-6 bg-gray-100 rounded animate-pulse" />
                                        ) : price !== null ? (
                                            <span className="text-xl font-bold text-primary">{formatCurrency(price)}</span>
                                        ) : (
                                            <span className="text-sm text-red-500">Tidak tersedia</span>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Note */}
                                <div className="mt-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Invoice resmi akan diterbitkan secara otomatis setelah pembayaran berhasil dilakukan.
                                        Anda dapat mengunduh invoice melalui halaman langganan Anda.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Payment Card */}
                    <div className="lg:col-span-2">
                        <div className="rounded-3xl border border-primary/15 bg-white shadow-xl shadow-primary/5 overflow-hidden sticky top-32">
                            {/* Card Header */}
                            <div className="bg-gradient-to-br from-primary via-secondary to-primary px-6 py-6 text-white">
                                <h2 className="text-lg font-bold">Pembayaran</h2>
                                <p className="text-white/70 text-sm mt-0.5">Selesaikan pembayaran Anda</p>
                            </div>

                            <div className="px-6 py-6">
                                {/* Quick Summary */}
                                <div className="rounded-2xl bg-slate-50 p-4 mb-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-gray-500">Paket</span>
                                        <span className="text-sm font-bold text-gray-900">{planLabels[plan] ?? plan}</span>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-gray-500">Periode</span>
                                        <span className="text-sm font-semibold text-gray-700">
                                            {interval === 'MONTHLY' ? 'Bulanan' : 'Tahunan'}
                                        </span>
                                    </div>
                                    <div className="border-t border-slate-200 my-2" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-700">Total</span>
                                        {status === 'loading-price' ? (
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                            </div>
                                        ) : price !== null ? (
                                            <span className="text-lg font-bold text-primary">{formatCurrency(price)}</span>
                                        ) : (
                                            <span className="text-sm text-red-500">-</span>
                                        )}
                                    </div>
                                </div>

                                {/* Payment Method Info */}
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50 mb-5">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-700">Online Payment</p>
                                        <p className="text-[10px] text-gray-500">Transfer Bank, E-Wallet, QRIS, dll.</p>
                                    </div>
                                </div>

                                {/* Status message */}
                                {message ? (
                                    <div className={`rounded-xl px-4 py-3 mb-4 text-sm font-medium ${status === 'success'
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

                                {/* Pay button */}
                                {status !== 'success' ? (
                                    <button
                                        type="button"
                                        onClick={() => void handlePay()}
                                        disabled={status !== 'ready' && !['error', 'pending'].includes(status)}
                                        className="w-full rounded-xl bg-primary py-3.5 text-center text-sm font-bold text-white transition-all hover:bg-secondary hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:shadow-none"
                                    >
                                        {isProcessing ? (
                                            <span className="inline-flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                {status === 'creating' ? 'Menyiapkan...' : status === 'verifying' ? 'Memverifikasi...' : 'Menunggu pembayaran...'}
                                            </span>
                                        ) : status === 'error' || status === 'pending' ? (
                                            'Coba Lagi'
                                        ) : (
                                            'Bayar Sekarang'
                                        )}
                                    </button>
                                ) : (
                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 mb-3">
                                            <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        {invoiceId ? (
                                            <p className="text-sm text-text-dark/50">Mengalihkan ke invoice Anda...</p>
                                        ) : (
                                            <p className="text-sm text-text-dark/50">Mengalihkan ke halaman langganan...</p>
                                        )}
                                    </div>
                                )}

                                {/* Security note */}
                                <div className="flex items-center gap-2 justify-center mt-5 text-[11px] text-text-dark/30">
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Pembayaran aman oleh Midtrans
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
