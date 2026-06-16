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

/** Sales contact for the enterprise (MNC/Group) plan. */
const MNC_CONTACT_HREF =
    'mailto:sales@taxindo.ai?subject=' + encodeURIComponent('Permintaan Paket MNC / Group - TPC AI');

type PlanMeta = {
    label: string;
    description: string;
    /** Short headline shown above the price. */
    tagline: string;
    features: string[];
    /** Heroicons-style outline path(s). */
    icon: string;
    accent: string;
    bg: string;
    border: string;
    badge: string;
    iconWrap: string;
    cta: string;
    glow: string;
    popular?: boolean;
    /** MNC/Group is enterprise-only — no public price, contact sales. */
    contactOnly?: boolean;
};

const planMeta: Record<string, PlanMeta> = {
    FREE: {
        label: 'Gratis',
        description: 'Coba langsung tanpa akun',
        tagline: 'Tanpa biaya',
        features: ['Akses Tax Knowledge terbatas', 'Tanpa login'],
        icon: 'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z',
        accent: 'text-slate-700',
        bg: 'bg-white',
        border: 'border-slate-200',
        badge: 'bg-slate-100 text-slate-600',
        iconWrap: 'bg-slate-100 text-slate-600',
        cta: 'bg-slate-800 text-white hover:bg-slate-700',
        glow: 'hover:shadow-slate-200/60',
    },
    FREE_LOGIN: {
        label: 'Free',
        description: 'Gratis, cukup daftar akun',
        tagline: 'Mulai gratis',
        features: ['Model: Owlie Lite', 'Kuota dasar untuk mencoba', 'Tax Knowledge lengkap', 'Riwayat percakapan tersimpan'],
        icon: 'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z',
        accent: 'text-blue-600',
        bg: 'bg-white',
        border: 'border-slate-200',
        badge: 'bg-blue-50 text-blue-600',
        iconWrap: 'bg-blue-50 text-blue-600',
        cta: 'bg-blue-600 text-white hover:bg-blue-500',
        glow: 'hover:shadow-blue-200/50',
    },
    STUDENT: {
        label: 'Student',
        description: 'Untuk pelajar & mahasiswa',
        tagline: 'Perlu verifikasi KYC',
        features: ['Model: Owlie Lite & Chat', 'Kuota ringkas untuk pelajar', 'Tax Knowledge lengkap', 'Perlu verifikasi status pelajar (KYC)'],
        icon: 'M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5',
        accent: 'text-emerald-600',
        bg: 'bg-white',
        border: 'border-slate-200',
        badge: 'bg-emerald-50 text-emerald-600',
        iconWrap: 'bg-emerald-50 text-emerald-600',
        cta: 'bg-emerald-600 text-white hover:bg-emerald-500',
        glow: 'hover:shadow-emerald-200/50',
    },
    UMKM: {
        label: 'UMKM',
        description: 'Untuk pelaku usaha & konsultan',
        tagline: 'Paling populer',
        features: ['Model: Owlie Lite, Chat & Pro', 'Kuota standar untuk kebutuhan harian', 'Koleksi dokumen pajak domestik', 'Riwayat percakapan tersimpan'],
        icon: 'M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z',
        accent: 'text-primary',
        bg: 'bg-white',
        border: 'border-primary',
        badge: 'bg-primary/10 text-primary',
        iconWrap: 'bg-primary/10 text-primary',
        cta: 'bg-primary text-white hover:bg-secondary',
        glow: 'hover:shadow-primary/25',
        popular: true,
    },
    ENTERPRISE: {
        label: 'Enterprise',
        description: 'Untuk perusahaan & tim besar',
        tagline: 'Untuk tim',
        features: ['Model: Owlie Lite, Chat & Pro', 'Kuota ±3x lebih banyak dari UMKM', 'Koleksi dokumen pajak domestik', 'Dukungan prioritas'],
        icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z',
        accent: 'text-indigo-600',
        bg: 'bg-white',
        border: 'border-slate-200',
        badge: 'bg-indigo-50 text-indigo-600',
        iconWrap: 'bg-indigo-50 text-indigo-600',
        cta: 'bg-indigo-600 text-white hover:bg-indigo-500',
        glow: 'hover:shadow-indigo-200/50',
    },
    UNLIMITED: {
        label: 'Corporate Unlimited',
        description: 'Untuk korporasi kebutuhan tinggi',
        tagline: 'Kuota terbesar',
        features: ['Semua model termasuk Owlie Max', 'Kuota ±10x lebih banyak dari UMKM', 'Pajak domestik & internasional', 'Dukungan prioritas'],
        icon: 'M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0',
        accent: 'text-amber-600',
        bg: 'bg-white',
        border: 'border-amber-200',
        badge: 'bg-amber-50 text-amber-600',
        iconWrap: 'bg-amber-50 text-amber-600',
        cta: 'bg-amber-500 text-white hover:bg-amber-400',
        glow: 'hover:shadow-amber-200/50',
    },
    MNC: {
        label: 'MNC / Group',
        description: 'Untuk korporasi multinasional & grup',
        tagline: 'Solusi enterprise',
        features: ['Semua model termasuk Owlie Max', 'Organisasi multi-pengguna (multi-seat)', 'Kuota ±17x lebih banyak dari Corporate Unlimited', 'Account manager khusus', 'Dukungan prioritas 24/7'],
        icon: 'M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418',
        accent: 'text-white',
        bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
        border: 'border-slate-700',
        badge: 'bg-white/10 text-white/90',
        iconWrap: 'bg-white/10 text-white',
        cta: 'bg-white text-slate-900 hover:bg-slate-100',
        glow: 'hover:shadow-white/10',
        contactOnly: true,
    },
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const PlanIcon = ({ path, className }: { path: string; className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
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

    // Standard vertical plan card (Free, Student, UMKM, Enterprise, Unlimited).
    const renderCard = (plan: string, compact = false) => {
        const meta = planMeta[plan];
        const planPrice = getPrice(plan);
        const isFree = plan === 'FREE_LOGIN';
        const isStudent = plan === 'STUDENT';

        let ctaHref: string;
        let ctaLabel: string;
        if (isFree) {
            ctaHref = '/register';
            ctaLabel = 'Mulai Gratis';
        } else if (isStudent) {
            ctaHref = studentEligible ? `/payment?plan=STUDENT&interval=${interval}` : '/kyc';
            ctaLabel = studentEligible ? 'Berlangganan' : 'Verifikasi KYC';
        } else if (planPrice !== null) {
            ctaHref = `/payment?plan=${plan}&interval=${interval}`;
            ctaLabel = 'Berlangganan';
        } else {
            ctaHref = '/login';
            ctaLabel = 'Hubungi Kami';
        }

        return (
            <div
                key={plan}
                className={`group relative flex flex-col rounded-3xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${meta.glow} ${meta.bg} ${meta.border} ${compact ? 'p-5' : 'p-7'} ${meta.popular ? 'lg:scale-[1.03] shadow-lg ring-1 ring-primary/20' : ''}`}
            >
                {meta.popular ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-primary px-4 py-1 text-xs font-bold text-white shadow-lg shadow-primary/30">
                            Paling Populer
                        </span>
                    </div>
                ) : null}

                <div className={`flex items-center gap-3 ${compact ? 'mb-3' : 'mb-5'}`}>
                    <span className={`inline-flex items-center justify-center rounded-2xl ${meta.iconWrap} ${compact ? 'h-9 w-9' : 'h-11 w-11'}`}>
                        <PlanIcon path={meta.icon} className={compact ? 'h-5 w-5' : 'h-6 w-6'} />
                    </span>
                    <div>
                        <h3 className={`font-bold leading-tight text-text-dark ${compact ? 'text-base' : 'text-lg'}`}>{meta.label}</h3>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-dark/40">{meta.tagline}</p>
                    </div>
                </div>

                {!compact && <p className="mb-5 text-sm text-text-dark/60">{meta.description}</p>}

                <div className={compact ? 'mb-4 min-h-[48px]' : 'mb-6 min-h-[64px]'}>
                    {isFree ? (
                        <div className={`font-bold ${meta.accent} ${compact ? 'text-2xl' : 'text-3xl'}`}>Gratis</div>
                    ) : planPrice !== null ? (
                        <>
                            <div className="flex items-end gap-1">
                                <span className={`font-bold leading-none ${meta.accent} ${compact ? 'text-2xl' : 'text-3xl'}`}>{formatCurrency(planPrice)}</span>
                            </div>
                            <p className="text-xs mt-1.5 text-text-dark/50">per {interval === 'MONTHLY' ? 'bulan' : 'tahun'}</p>
                        </>
                    ) : (
                        <div className={`font-bold ${meta.accent} ${compact ? 'text-lg' : 'text-xl'}`}>Hubungi Kami</div>
                    )}
                </div>

                <ul className={`flex-1 text-text-dark/70 ${compact ? 'space-y-1.5 text-[13px] mb-5' : 'space-y-3 text-sm mb-7'}`}>
                    {meta.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5">
                            <span className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-secondary/10">
                                <CheckIcon className="h-3 w-3 text-secondary" />
                            </span>
                            {feat}
                        </li>
                    ))}
                </ul>

                <Link href={ctaHref} className={`block w-full rounded-xl text-center text-sm font-bold transition-all shadow-sm ${meta.cta} ${compact ? 'py-2.5' : 'py-3'}`}>
                    {ctaLabel}
                </Link>
            </div>
        );
    };

    // Slim mini-card for the entry-level plans (Free, Student) in the hero.
    const renderMiniCard = (plan: string) => {
        const meta = planMeta[plan];
        const isFree = plan === 'FREE_LOGIN';
        const planPrice = getPrice(plan);

        let ctaHref: string;
        let ctaLabel: string;
        let priceLabel: string;
        if (isFree) {
            ctaHref = '/register';
            ctaLabel = 'Mulai Gratis';
            priceLabel = 'Gratis';
        } else {
            ctaHref = studentEligible ? `/payment?plan=STUDENT&interval=${interval}` : '/kyc';
            ctaLabel = studentEligible ? 'Berlangganan' : 'Verifikasi KYC';
            priceLabel = planPrice !== null ? formatCurrency(planPrice) : 'Hubungi Kami';
        }

        return (
            <article className="flex flex-col rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                <div className="mb-2 flex items-center gap-2.5">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${meta.iconWrap}`}>
                        <PlanIcon path={meta.icon} className="h-[18px] w-[18px]" />
                    </span>
                    <strong className="text-base font-bold text-text-dark">{meta.label}</strong>
                </div>
                <span className="block min-h-[40px] text-[13px] leading-snug text-text-dark/55">{meta.description}</span>
                <div className={`mt-3 text-2xl font-extrabold tracking-tight ${meta.accent}`}>{priceLabel}</div>
                <Link href={ctaHref} className={`mt-4 block w-full rounded-xl py-2.5 text-center text-sm font-bold transition-all shadow-sm ${meta.cta}`}>
                    {ctaLabel}
                </Link>
            </article>
        );
    };

    // Wide, full-width MNC / Group band (3 columns: pitch · features · CTA).
    const renderMncCard = () => {
        const meta = planMeta.MNC;
        return (
            <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-lg md:p-10">
                <div className="grid gap-8 lg:grid-cols-[0.9fr_1.3fr_0.7fr] lg:items-center lg:gap-10">
                    {/* Pitch */}
                    <div>
                        <div className="mb-4 flex items-center gap-3">
                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                                <PlanIcon path={meta.icon} className="h-6 w-6" />
                            </span>
                            <div>
                                <h3 className="text-2xl font-bold text-white">{meta.label}</h3>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">{meta.tagline}</p>
                            </div>
                        </div>
                        <p className="mb-5 max-w-sm text-sm leading-relaxed text-white/60">{meta.description}</p>
                        <div className="text-3xl font-extrabold tracking-tight text-white">Custom</div>
                        <p className="mt-1 text-xs text-white/50">Harga sesuai kebutuhan perusahaan</p>
                    </div>

                    {/* Features (2 columns) */}
                    <ul className="grid gap-3 text-sm text-white/80 sm:grid-cols-2 lg:gap-x-8 lg:gap-y-4">
                        {meta.features.map((feat) => (
                            <li key={feat} className="flex items-start gap-2.5">
                                <span className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
                                    <CheckIcon className="h-3 w-3 text-white" />
                                </span>
                                {feat}
                            </li>
                        ))}
                    </ul>

                    {/* CTA */}
                    <div className="lg:text-right">
                        <Link
                            href={MNC_CONTACT_HREF}
                            className="inline-flex w-full items-center justify-center rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-slate-900 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-100"
                        >
                            Hubungi Kami
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section id="pricing" className="relative py-24 bg-gradient-to-b from-neutral-light via-white to-neutral-light overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

            <div className="relative z-10 container mx-auto px-6">
                {/* Hero: heading + entry-level mini cards */}
                <div className="mb-12 grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.4em] text-secondary">Pricing</p>
                        <h2 className="font-playfair text-4xl font-bold leading-[1.05] tracking-tight text-text-dark md:text-5xl">
                            Pilih paket sesuai skala pekerjaan pajakmu.
                        </h2>
                        <p className="mt-4 max-w-xl text-lg leading-relaxed text-text-dark/60">
                            Free dan Student sebagai akses awal. Fokus utama pada paket berbayar: UMKM, Enterprise,
                            Corporate Unlimited, dan MNC / Group.
                        </p>
                        {/* Interval Toggle */}
                        <div className="mt-6 flex">
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
                    </div>

                    {/* Entry-level mini cards */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        {renderMiniCard('FREE_LOGIN')}
                        {renderMiniCard('STUDENT')}
                    </div>
                </div>

                {/* Paid plans */}
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
                    <div className="space-y-6">
                        {/* Three primary plans */}
                        <div className="grid items-stretch gap-6 pt-3 lg:grid-cols-3">
                            {renderCard('UMKM')}
                            {renderCard('ENTERPRISE')}
                            {renderCard('UNLIMITED')}
                        </div>

                        {/* MNC / Group band */}
                        {renderMncCard()}
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
