'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type PlanPrice = {
    plan: string;
    interval: string;
    currency: string;
    amount: number;
};

type AddonPrice = {
    addon: string;
    interval: string;
    currency: string;
    amount: number;
};

type Interval = 'MONTHLY' | 'YEARLY';

const planOrder = ['FREE_LOGIN', 'UMKM', 'ENTERPRISE', 'MNC'] as const;

/* ─── AI Add-on tiers ─── */
const addonOrder = ['STARTER', 'PRO', 'UNLIMITED'] as const;

const addonMeta: Record<string, { label: string; shortDesc: string; features: string[]; color: string; gradient: string; border: string; badge: string }> = {
    STARTER: {
        label: 'AI Starter',
        shortDesc: 'Lite + Chat (kuota harian)',
        features: ['Owlie Lite (offline)', 'Owlie Chat v1.5', 'Kuota harian terbatas', 'Riwayat percakapan'],
        color: 'text-emerald-600',
        gradient: 'from-emerald-50 to-white',
        border: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-700',
    },
    PRO: {
        label: 'AI Pro',
        shortDesc: 'Semua + Thinking (kuota harian)',
        features: ['Semua fitur Starter', 'Owlie Thinking v1.5', 'Kuota harian lebih besar', 'Prioritas respons'],
        color: 'text-primary',
        gradient: 'from-teal-50 via-white to-cyan-50',
        border: 'border-primary/30 ring-2 ring-primary/10',
        badge: 'bg-primary/10 text-primary',
    },
    UNLIMITED: {
        label: 'AI Unlimited',
        shortDesc: 'Semua model, tanpa batas',
        features: ['Semua fitur Pro', 'Owlie Max v1.5', 'Tanpa batas kuota', 'Advanced RAG & Studio'],
        color: 'text-amber-600',
        gradient: 'from-amber-50 via-white to-orange-50',
        border: 'border-amber-300 ring-2 ring-amber-200/50',
        badge: 'bg-amber-100 text-amber-700',
    },
};

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
        features: ['Akses Tax Knowledge lengkap', 'Riwayat percakapan', 'Trial AI Starter 7 hari'],
        accent: 'text-blue-700',
        bg: 'bg-gradient-to-br from-blue-50 to-white',
        border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-700',
        cta: 'bg-blue-600 text-white hover:bg-blue-500',
        ctaHover: 'hover:shadow-blue-200/50',
    },
    UMKM: {
        label: 'UMKM',
        description: 'Untuk pelaku usaha & konsultan pajak',
        features: ['Akses Tax Knowledge lengkap', 'Koleksi dokumen pajak domestik', 'Riwayat percakapan', 'Dukungan email'],
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
        features: ['Semua fitur UMKM', 'Koleksi dokumen pajak domestik', 'Prioritas respons', 'Dukungan prioritas'],
        accent: 'text-indigo-700',
        bg: 'bg-gradient-to-br from-indigo-50 via-white to-violet-50',
        border: 'border-indigo-200',
        badge: 'bg-indigo-100 text-indigo-700',
        cta: 'bg-indigo-600 text-white hover:bg-indigo-500',
        ctaHover: 'hover:shadow-indigo-200/50',
    },
    MNC: {
        label: 'MNC / Group',
        description: 'Untuk korporasi multinasional',
        features: ['Semua fitur Enterprise', 'Semua koleksi dokumen', 'Pajak domestik & internasional', 'Dukungan prioritas 24/7', 'Account manager khusus'],
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
    const [addonInterval, setAddonInterval] = useState<Interval>('MONTHLY');
    const [prices, setPrices] = useState<PlanPrice[]>([]);
    const [addonPrices, setAddonPrices] = useState<AddonPrice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAddons, setSelectedAddons] = useState<Record<string, string | null>>({});

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const [priceRes, addonPriceRes] = await Promise.all([
                    fetch('/api/public/plan-prices'),
                    fetch('/api/public/ai-addon-prices'),
                ]);
                if (priceRes.ok) {
                    const data = (await priceRes.json()) as { prices: PlanPrice[] };
                    setPrices(data.prices ?? []);
                }
                if (addonPriceRes.ok) {
                    const data = (await addonPriceRes.json()) as { prices: AddonPrice[] };
                    setAddonPrices(data.prices ?? []);
                }
            } catch {
                // silently fail
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, []);

    const getPrice = (plan: string): number | null => {
        const match = prices.find((p) => p.plan === plan && p.interval === interval);
        return match ? match.amount : null;
    };

    const getAddonPrice = (addon: string): number | null => {
        const match = addonPrices.find((p) => p.addon === addon && p.interval === interval);
        return match ? match.amount : null;
    };

    const getAddonOnlyPrice = (addon: string): number | null => {
        const match = addonPrices.find((p) => p.addon === addon && p.interval === addonInterval);
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
                        Mulai gratis, upgrade kapan saja. Tambahkan AI Add-on untuk akses Owlie AI.
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
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
                        {planOrder.map((plan) => {
                            const meta = planMeta[plan];
                            const planPrice = getPrice(plan);
                            const isDark = plan === 'MNC';
                            const isFree = plan === 'FREE_LOGIN';
                            const chosenAddon = selectedAddons[plan] ?? null;
                            const addonP = chosenAddon ? getAddonPrice(chosenAddon) : null;

                            // Total price = plan price + addon price (if selected)
                            const totalPrice = (() => {
                                if (isFree) return addonP; // free plan = addon only
                                if (planPrice === null) return null; // hubungi kami
                                return addonP !== null ? planPrice + addonP : planPrice;
                            })();

                            const toggleAddon = (addon: string) => {
                                setSelectedAddons((prev) => ({
                                    ...prev,
                                    [plan]: prev[plan] === addon ? null : addon,
                                }));
                            };

                            // Build CTA href
                            const ctaHref = (() => {
                                if (isFree) {
                                    return chosenAddon
                                        ? `/register?addon=${chosenAddon}`
                                        : '/register';
                                }
                                const base = `/payment?plan=${plan}&interval=${interval}`;
                                return chosenAddon ? `${base}&addon=${chosenAddon}` : base;
                            })();

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
                                            {chosenAddon ? (
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${isDark ? 'bg-white/15 text-white/80' : 'bg-primary/10 text-primary'}`}>
                                                    + {addonMeta[chosenAddon]?.label}
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className={`mt-3 text-sm ${isDark ? 'text-white/60' : 'text-text-dark/60'}`}>
                                            {meta.description}
                                        </p>
                                    </div>

                                    {/* Price — updates when addon selected */}
                                    <div className="mb-6 min-h-[72px]">
                                        {isFree && !chosenAddon ? (
                                            <div className={`text-3xl font-bold ${meta.accent}`}>
                                                Gratis
                                            </div>
                                        ) : totalPrice !== null ? (
                                            <>
                                                <div className={`text-2xl lg:text-3xl font-bold ${meta.accent} break-words leading-tight transition-all`}>
                                                    {formatCurrency(totalPrice)}
                                                </div>
                                                <p className={`text-xs mt-1 ${isDark ? 'text-white/50' : 'text-text-dark/50'}`}>
                                                    / {interval === 'MONTHLY' ? 'bulan' : 'tahun'}
                                                </p>
                                                {/* Breakdown */}
                                                {chosenAddon && !isFree && planPrice !== null && addonP !== null ? (
                                                    <p className={`text-[10px] mt-1.5 ${isDark ? 'text-white/35' : 'text-text-dark/35'}`}>
                                                        {formatCurrency(planPrice)} plan + {formatCurrency(addonP)} AI
                                                    </p>
                                                ) : null}
                                                {chosenAddon && isFree && addonP !== null ? (
                                                    <p className={`text-[10px] mt-1.5 ${isDark ? 'text-white/35' : 'text-text-dark/35'}`}>
                                                        Plan gratis + {formatCurrency(addonP)} AI
                                                    </p>
                                                ) : null}
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

                                    {/* ─── AI Add-on Selector (toggle inside card) ─── */}
                                    <div className={`mb-6 rounded-2xl p-4 ${isDark ? 'bg-white/5' : 'bg-gradient-to-br from-slate-50 to-slate-100/50'}`}>
                                        <div className="flex items-center gap-1.5 mb-3">
                                            <svg className={`h-3.5 w-3.5 ${isDark ? 'text-white/50' : 'text-primary/60'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <p className={`text-[10px] uppercase tracking-[0.25em] font-semibold ${isDark ? 'text-white/50' : 'text-text-dark/40'}`}>
                                                Tambah AI Add-on
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            {addonOrder.map((addon) => {
                                                const am = addonMeta[addon];
                                                const addonPrice = getAddonPrice(addon);
                                                const isSelected = chosenAddon === addon;
                                                return (
                                                    <button
                                                        key={addon}
                                                        type="button"
                                                        onClick={() => toggleAddon(addon)}
                                                        className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all text-left ${
                                                            isSelected
                                                                ? isDark
                                                                    ? 'bg-white/15 border-2 border-white/40 ring-1 ring-white/20'
                                                                    : 'bg-primary/10 border-2 border-primary/40 ring-1 ring-primary/20'
                                                                : isDark
                                                                    ? 'bg-white/5 hover:bg-white/10 border border-white/10'
                                                                    : 'bg-white hover:bg-primary/5 border border-slate-200 hover:border-primary/30'
                                                        }`}
                                                    >
                                                        {/* Radio indicator */}
                                                        <span className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                                            isSelected
                                                                ? isDark ? 'border-white bg-white' : 'border-primary bg-primary'
                                                                : isDark ? 'border-white/30' : 'border-slate-300'
                                                        }`}>
                                                            {isSelected ? (
                                                                <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-slate-900' : 'bg-white'}`} />
                                                            ) : null}
                                                        </span>

                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-xs font-semibold leading-tight ${
                                                                isSelected
                                                                    ? isDark ? 'text-white' : 'text-primary'
                                                                    : isDark ? 'text-white/90' : 'text-text-dark/80'
                                                            }`}>
                                                                {am.label}
                                                            </p>
                                                            <p className={`text-[10px] leading-tight mt-0.5 ${isDark ? 'text-white/40' : 'text-text-dark/40'}`}>
                                                                {am.shortDesc}
                                                            </p>
                                                        </div>
                                                        {addonPrice !== null ? (
                                                            <span className={`text-[11px] font-bold whitespace-nowrap ${
                                                                isSelected
                                                                    ? isDark ? 'text-white' : 'text-primary'
                                                                    : isDark ? 'text-white/70' : 'text-text-dark/60'
                                                            }`}>
                                                                +{formatCurrency(addonPrice)}
                                                            </span>
                                                        ) : (
                                                            <span className={`text-[10px] ${isDark ? 'text-white/40' : 'text-text-dark/40'}`}>Hubungi</span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {isFree ? (
                                            <p className={`mt-2.5 text-[10px] text-center ${isDark ? 'text-white/30' : 'text-text-dark/35'}`}>
                                                Trial 7 hari AI Starter gratis untuk pengguna baru
                                            </p>
                                        ) : null}
                                    </div>

                                    {/* CTA */}
                                    {isFree ? (
                                        <Link
                                            href={ctaHref}
                                            className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-all shadow-sm ${meta.cta}`}
                                        >
                                            Mulai Gratis
                                        </Link>
                                    ) : totalPrice !== null ? (
                                        <Link
                                            href={ctaHref}
                                            className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-all shadow-sm ${meta.cta}`}
                                        >
                                            {chosenAddon ? 'Berlangganan + AI' : 'Berlangganan'}
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

                {/* ─── AI Add-on Only Section ─── */}
                {!isLoading && !compact && (
                    <div className="mt-20 max-w-5xl mx-auto">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 px-5 py-2 mb-4">
                                <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI Add-on</span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold font-playfair text-text-dark mb-3">
                                Sudah Punya Plan? Tambah AI Saja
                            </h3>
                            <p className="text-sm text-text-dark/50 max-w-lg mx-auto">
                                Beli AI Add-on terpisah tanpa perlu ganti plan. Cocok untuk yang sudah berlangganan dan ingin akses Owlie AI.
                            </p>

                            {/* Addon Interval Toggle */}
                            <div className="flex items-center justify-center gap-1 mt-8">
                                <div className="relative flex rounded-full bg-slate-100 p-1">
                                    <button
                                        type="button"
                                        onClick={() => setAddonInterval('MONTHLY')}
                                        className={`relative z-10 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${addonInterval === 'MONTHLY'
                                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                                : 'text-text-dark/60 hover:text-text-dark'
                                            }`}
                                    >
                                        Bulanan
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAddonInterval('YEARLY')}
                                        className={`relative z-10 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${addonInterval === 'YEARLY'
                                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                                : 'text-text-dark/60 hover:text-text-dark'
                                            }`}
                                    >
                                        Tahunan
                                        <span className="ml-1.5 rounded-full bg-accent-warm/20 px-2 py-0.5 text-[10px] font-bold text-accent-warm">
                                            Hemat
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {addonOrder.map((addon) => {
                                const am = addonMeta[addon];
                                const addonPrice = getAddonOnlyPrice(addon);
                                const isPopular = addon === 'PRO';

                                return (
                                    <div
                                        key={addon}
                                        className={`relative flex flex-col rounded-3xl border p-6 shadow-sm transition-all duration-300 hover:shadow-xl bg-gradient-to-br ${am.gradient} ${am.border}`}
                                    >
                                        {isPopular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                <span className="rounded-full bg-primary px-4 py-1 text-xs font-bold text-white shadow-lg shadow-primary/30">
                                                    Populer
                                                </span>
                                            </div>
                                        )}

                                        <div className="mb-4">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${am.badge}`}>
                                                {am.label}
                                            </span>
                                            <p className="mt-2 text-sm text-text-dark/50">
                                                {am.shortDesc}
                                            </p>
                                        </div>

                                        {/* Price */}
                                        <div className="mb-5 min-h-[56px]">
                                            {addonPrice !== null ? (
                                                <>
                                                    <div className={`text-2xl lg:text-3xl font-bold ${am.color}`}>
                                                        {formatCurrency(addonPrice)}
                                                    </div>
                                                    <p className="text-xs mt-1 text-text-dark/50">
                                                        / {addonInterval === 'MONTHLY' ? 'bulan' : 'tahun'}
                                                    </p>
                                                </>
                                            ) : (
                                                <div className={`text-xl font-bold ${am.color}`}>Hubungi Kami</div>
                                            )}
                                        </div>

                                        {/* Features */}
                                        <ul className="flex-1 space-y-2.5 text-sm mb-6 text-text-dark/70">
                                            {am.features.map((feat) => (
                                                <li key={feat} className="flex items-start gap-2">
                                                    <CheckIcon className="h-4 w-4 mt-0.5 flex-shrink-0 text-secondary" />
                                                    {feat}
                                                </li>
                                            ))}
                                        </ul>

                                        {/* CTA */}
                                        {addonPrice !== null ? (
                                            <Link
                                                href={`/payment?type=ai-addon&addon=${addon}&interval=${addonInterval}`}
                                                className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-all shadow-sm ${
                                                    isPopular
                                                        ? 'bg-primary text-white hover:bg-secondary'
                                                        : 'bg-text-dark text-white hover:bg-text-dark/80'
                                                }`}
                                            >
                                                Beli {am.label}
                                            </Link>
                                        ) : (
                                            <Link
                                                href="/login"
                                                className="block w-full rounded-xl py-3 text-center text-sm font-bold transition-all shadow-sm bg-text-dark text-white hover:bg-text-dark/80"
                                            >
                                                Hubungi Kami
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
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
