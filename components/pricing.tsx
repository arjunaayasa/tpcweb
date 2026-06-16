'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type PlanPrice = {
    plan: string;
    interval: string;
    currency: string;
    amount: number;
};

type Interval = 'MONTHLY' | 'YEARLY';

const planOrder = ['FREE_LOGIN', 'STUDENT', 'UMKM', 'ENTERPRISE', 'UNLIMITED', 'MNC'] as const;

const planMeta: Record<
    string,
    {
        label: string;
        description: string;
        features: string[];
        accent: string;
        bg: string;
        border: string;
        badge: string;
        cta: string;
        ctaHover: string;
        popular?: boolean;
    }
> = {
    FREE: {
        label: 'Gratis',
        description: 'Coba langsung tanpa akun',
        features: ['Akses Tax Knowledge terbatas', 'Tanpa login'],
        accent: 'text-slate-700',
        bg: 'bg-white',
        border: 'border-slate-200',
        badge: 'bg-slate-100 text-slate-600',
        cta: 'bg-slate-800 text-white hover:bg-slate-700',
        ctaHover: 'hover:shadow-slate-200/50',
    },
    FREE_LOGIN: {
        label: 'Free Plan',
        description: 'Gratis, cukup daftar akun',
        features: ['Akses Owlie Lite', 'Akses Tax Knowledge lengkap', 'Riwayat percakapan'],
        accent: 'text-blue-700',
        bg: 'bg-gradient-to-br from-blue-50 to-white',
        border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-700',
        cta: 'bg-blue-600 text-white hover:bg-blue-500',
        ctaHover: 'hover:shadow-blue-200/50',
    },
    STUDENT: {
        label: 'Student',
        description: 'Untuk pelajar & mahasiswa (perlu verifikasi KYC)',
        features: ['Akses Owlie Lite + Chat', 'Akses Tax Knowledge lengkap', 'Riwayat percakapan', 'Perlu verifikasi status pelajar'],
        accent: 'text-emerald-700',
        bg: 'bg-gradient-to-br from-emerald-50 via-white to-teal-50',
        border: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-700',
        cta: 'bg-emerald-600 text-white hover:bg-emerald-500',
        ctaHover: 'hover:shadow-emerald-200/50',
    },
    UMKM: {
        label: 'UMKM',
        description: 'Untuk pelaku usaha & konsultan pajak',
        features: ['Akses Owlie Lite + Chat + Pro', 'Koleksi dokumen pajak domestik', 'Riwayat percakapan', 'Dukungan email'],
        accent: 'text-primary',
        bg: 'bg-gradient-to-br from-teal-50 via-white to-cyan-50',
        border: 'border-primary/30 ring-2 ring-primary/10',
        badge: 'bg-primary/10 text-primary',
        cta: 'bg-primary text-white hover:bg-secondary',
        ctaHover: 'hover:shadow-primary/20',
        popular: true,
    },
    ENTERPRISE: {
        label: 'Enterprise',
        description: 'Untuk perusahaan & tim besar',
        features: ['Akses Owlie Lite + Chat + Pro', 'Koleksi dokumen pajak domestik', 'Prioritas respons', 'Dukungan prioritas'],
        accent: 'text-indigo-700',
        bg: 'bg-gradient-to-br from-indigo-50 via-white to-violet-50',
        border: 'border-indigo-200',
        badge: 'bg-indigo-100 text-indigo-700',
        cta: 'bg-indigo-600 text-white hover:bg-indigo-500',
        ctaHover: 'hover:shadow-indigo-200/50',
    },
    UNLIMITED: {
        label: 'Corporate Unlimited',
        description: 'Untuk korporasi dengan kebutuhan tinggi',
        features: ['Akses semua model termasuk Owlie Max', 'Semua koleksi dokumen', 'Pajak domestik & internasional', 'Kuota gabungan besar', 'Dukungan prioritas'],
        accent: 'text-amber-700',
        bg: 'bg-gradient-to-br from-amber-50 via-white to-orange-50',
        border: 'border-amber-200',
        badge: 'bg-amber-100 text-amber-700',
        cta: 'bg-amber-600 text-white hover:bg-amber-500',
        ctaHover: 'hover:shadow-amber-200/50',
    },
    MNC: {
        label: 'MNC / Group',
        description: 'Untuk korporasi multinasional & grup',
        features: ['Akses semua model termasuk Owlie Max', 'Organisasi multi-pengguna (multi-seat)', 'Pajak domestik & internasional', 'Dukungan prioritas 24/7', 'Account manager khusus'],
        accent: 'text-white',
        bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
        border: 'border-slate-700',
        badge: 'bg-white/15 text-white/90',
        cta: 'bg-white text-slate-900 hover:bg-slate-100',
        ctaHover: 'hover:shadow-white/10',
    },
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

type PricingProps = {
    compact?: boolean;
};

export default function Pricing({ compact = false }: PricingProps) {
    const [interval, setInterval] = useState<Interval>('MONTHLY');
    const [prices, setPrices] = useState<PlanPrice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // null = unknown/not logged in; true/false = KYC eligibility resolved
    const [studentEligible, setStudentEligible] = useState<boolean>(false);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const priceRes = await fetch('/api/public/plan-prices');
                if (priceRes.ok) {
                    const data = (await priceRes.json()) as { prices: PlanPrice[] };
                    setPrices(data.prices ?? []);
                }
            } catch {
                // silently fail
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, []);

    // Resolve Student KYC eligibility for the current viewer (best-effort).
    useEffect(() => {
        const loadEligibility = async () => {
            try {
                const res = await fetch('/api/kyc/me', { credentials: 'include' });
                if (!res.ok) return;
                const data = (await res.json()) as {
                    studentEligibleUntil?: string | null;
                };
                const until = data.studentEligibleUntil
                    ? new Date(data.studentEligibleUntil).getTime()
                    : 0;
                setStudentEligible(until > Date.now());
            } catch {
                // not logged in / unavailable — treat as not eligible
            }
        };
        void loadEligibility();
    }, []);

    const getPrice = (plan: string): number | null => {
        const match = prices.find((p) => p.plan === plan && p.interval === interval);
        return match ? match.amount : null;
    };

    return (
        <section id="pricing" className="relative py-24 bg-gradient-to-b from-neutral-light via-white to-neutral-light overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

            <div className="relative z-10 container mx-auto px-6">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <p className="text-xs uppercase tracking-[0.4em] text-secondary font-semibold mb-3">Pricing</p>
                    <h2 className="text-4xl md:text-5xl font-bold font-playfair text-text-dark mb-4">
                        Pilih Paket Terbaik
                    </h2>
                    <p className="text-lg text-text-dark/60">
                        Mulai gratis, upgrade kapan saja.
                    </p>
                </div>

                {/* Interval Toggle */}
                <div className="flex items-center justify-center gap-1 mb-12">
                    <div className="relative flex rounded-full bg-slate-100 p-1">
                        <button
                            type="button"
                            onClick={() => setInterval('MONTHLY')}
                            className={`relative z-10 rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${interval === 'MONTHLY'
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'text-text-dark/60 hover:text-text-dark'
                                }`}
                        >
                            Bulanan
                        </button>
                        <button
                            type="button"
                            onClick={() => setInterval('YEARLY')}
                            className={`relative z-10 rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${interval === 'YEARLY'
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'text-text-dark/60 hover:text-text-dark'
                                }`}
                        >
                            Tahunan
                            <span className="ml-2 rounded-full bg-accent-warm/20 px-2 py-0.5 text-[10px] font-bold text-accent-warm">
                                Hemat
                            </span>
                        </button>
                    </div>
                </div>

                {/* Plan Cards */}
                {isLoading ? (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center gap-3 text-text-dark/50">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span className="text-sm">Memuat harga...</span>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                        {planOrder.map((plan) => {
                            const meta = planMeta[plan];
                            const planPrice = getPrice(plan);
                            const isDark = plan === 'MNC';
                            const isFree = plan === 'FREE_LOGIN';
                            const isStudent = plan === 'STUDENT';
                            const isMnc = plan === 'MNC';

                            // Build CTA href
                            let ctaHref: string;
                            if (isFree) {
                                ctaHref = '/register';
                            } else if (isStudent) {
                                ctaHref = studentEligible
                                    ? `/payment?plan=STUDENT&interval=${interval}`
                                    : '/kyc';
                            } else if (isMnc) {
                                ctaHref = '/checkout/organization';
                            } else {
                                ctaHref = `/payment?plan=${plan}&interval=${interval}`;
                            }

                            return (
                                <div
                                    key={plan}
                                    className={`relative flex flex-col rounded-3xl border p-6 shadow-sm transition-all duration-300 hover:shadow-xl ${meta.ctaHover} ${meta.bg} ${meta.border}`}
                                >
                                    {meta.popular ? (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span className="rounded-full bg-primary px-4 py-1 text-xs font-bold text-white shadow-lg shadow-primary/30">
                                                Paling Populer
                                            </span>
                                        </div>
                                    ) : null}

                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${meta.badge}`}>
                                                {meta.label}
                                            </span>
                                        </div>
                                        <p className={`mt-3 text-sm ${isDark ? 'text-white/60' : 'text-text-dark/60'}`}>
                                            {meta.description}
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-6 min-h-[72px]">
                                        {isFree ? (
                                            <div className={`text-3xl font-bold ${meta.accent}`}>
                                                Gratis
                                            </div>
                                        ) : planPrice !== null ? (
                                            <>
                                                <div className={`text-2xl lg:text-3xl font-bold ${meta.accent} break-words leading-tight transition-all`}>
                                                    {formatCurrency(planPrice)}
                                                </div>
                                                <p className={`text-xs mt-1 ${isDark ? 'text-white/50' : 'text-text-dark/50'}`}>
                                                    / {interval === 'MONTHLY' ? 'bulan' : 'tahun'}
                                                </p>
                                            </>
                                        ) : (
                                            <div className={`text-xl font-bold ${meta.accent}`}>
                                                Hubungi Kami
                                            </div>
                                        )}
                                    </div>

                                    {/* Features */}
                                    <ul className={`flex-1 space-y-3 text-sm mb-6 ${isDark ? 'text-white/80' : 'text-text-dark/70'}`}>
                                        {meta.features.map((feat) => (
                                            <li key={feat} className="flex items-start gap-2">
                                                <CheckIcon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-white/60' : 'text-secondary'}`} />
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    {isFree ? (
                                        <Link
                                            href={ctaHref}
                                            className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-all shadow-sm ${meta.cta}`}
                                        >
                                            Mulai Gratis
                                        </Link>
                                    ) : isStudent && !studentEligible ? (
                                        <Link
                                            href={ctaHref}
                                            className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-all shadow-sm ${meta.cta}`}
                                        >
                                            Verifikasi KYC
                                        </Link>
                                    ) : isMnc ? (
                                        <Link
                                            href={ctaHref}
                                            className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-all shadow-sm ${meta.cta}`}
                                        >
                                            Buat Organisasi
                                        </Link>
                                    ) : planPrice !== null ? (
                                        <Link
                                            href={ctaHref}
                                            className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-all shadow-sm ${meta.cta}`}
                                        >
                                            Berlangganan
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/login"
                                            className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-all shadow-sm ${meta.cta}`}
                                        >
                                            Hubungi Kami
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* "Lihat Selengkapnya" button (compact / landing page mode) */}
                {compact ? (
                    <div className="text-center mt-10">
                        <Link
                            href="/pricing"
                            className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-8 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20"
                        >
                            Lihat Selengkapnya
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                ) : null}

                {/* Bottom note */}
                <p className="text-center text-xs text-text-dark/40 mt-12">
                    Semua harga dalam Rupiah (IDR). Pajak tambahan mungkin berlaku.
                </p>
            </div>
        </section>
    );
}
