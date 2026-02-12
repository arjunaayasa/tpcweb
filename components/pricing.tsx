'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type PlanPrice = {
    plan: string;
    interval: string;
    currency: string;
    amount: number;
};

type PlanDef = {
    allowedModels?: string[];
    limits?: Record<string, unknown>;
};

type Interval = 'MONTHLY' | 'YEARLY';

const planOrder = ['FREE', 'BASIC', 'PLUS', 'MAX'] as const;

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
        description: 'Mulai jelajahi tanpa biaya',
        features: ['Akses Owlie Lite', 'Kuota terbatas', 'Dukungan komunitas'],
        accent: 'text-slate-700',
        bg: 'bg-white',
        border: 'border-slate-200',
        badge: 'bg-slate-100 text-slate-600',
        cta: 'bg-slate-800 text-white hover:bg-slate-700',
        ctaHover: 'hover:shadow-slate-200/50',
    },
    BASIC: {
        label: 'Dasar',
        description: 'Untuk profesional pajak pemula',
        features: ['Akses Owlie Chat', 'Kuota harian lebih besar', 'Dukungan email'],
        accent: 'text-blue-700',
        bg: 'bg-gradient-to-br from-blue-50 to-white',
        border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-700',
        cta: 'bg-blue-600 text-white hover:bg-blue-500',
        ctaHover: 'hover:shadow-blue-200/50',
    },
    PLUS: {
        label: 'Plus',
        description: 'Konsultan dan tim kecil',
        features: ['Semua fitur Dasar', 'Owlie Thinking v1.5', 'Kuota lebih besar', 'Prioritas respons'],
        accent: 'text-primary',
        bg: 'bg-gradient-to-br from-teal-50 via-white to-cyan-50',
        border: 'border-primary/30 ring-2 ring-primary/10',
        badge: 'bg-primary/10 text-primary',
        cta: 'bg-primary text-white hover:bg-secondary',
        ctaHover: 'hover:shadow-primary/20',
        popular: true,
    },
    MAX: {
        label: 'Maks',
        description: 'Untuk tim besar & enterprise',
        features: ['Semua fitur Plus', 'Owlie Max v1.5', 'Akses Owlie Studio', 'Kuota tak terbatas', 'Dukungan prioritas 24/7', 'Akses API', 'Account manager khusus'],
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

const modelLabelMap: Record<string, string> = {
    'owlie-loc': 'Owlie Lite',
    'owlie-chat': 'Owlie Chat v1.5',
    'owlie-thinking': 'Owlie Thinking v1.5',
    'owlie-max': 'Owlie Max v1.5',
};

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
    const [plans, setPlans] = useState<Record<string, PlanDef>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const [priceRes, planRes] = await Promise.all([
                    fetch('/api/public/plan-prices'),
                    fetch('/api/plans'),
                ]);
                if (priceRes.ok) {
                    const data = (await priceRes.json()) as { prices: PlanPrice[] };
                    setPrices(data.prices ?? []);
                }
                if (planRes.ok) {
                    const data = (await planRes.json()) as { plans: Record<string, PlanDef> };
                    setPlans(data.plans ?? {});
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

    const getModelCount = (plan: string): number => {
        const def = plans[plan];
        return def?.allowedModels?.length ?? 0;
    };

    const getModels = (plan: string): string[] => {
        const def = plans[plan];
        return def?.allowedModels ?? [];
    };

    const getLimits = (plan: string): Record<string, unknown> => {
        const def = plans[plan];
        return def?.limits ?? {};
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
                        Mulai gratis, upgrade kapan saja. Semua paket termasuk akses ke fitur AI perpajakan kami.
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
                            const price = getPrice(plan);
                            const modelCount = getModelCount(plan);
                            const models = getModels(plan);
                            const limits = getLimits(plan);
                            const isMax = plan === 'MAX';
                            const isFree = plan === 'FREE';

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
                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${meta.badge}`}>
                                            {meta.label}
                                        </span>
                                        <p className={`mt-3 text-sm ${isMax ? 'text-white/60' : 'text-text-dark/60'}`}>
                                            {meta.description}
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-6 min-h-[60px]">
                                        {isFree ? (
                                            <div className={`text-3xl font-bold ${meta.accent}`}>
                                                Gratis
                                            </div>
                                        ) : price !== null ? (
                                            <>
                                                <div className={`text-2xl lg:text-3xl font-bold ${meta.accent} break-words leading-tight`}>
                                                    {formatCurrency(price)}
                                                </div>
                                                <p className={`text-xs mt-1 ${isMax ? 'text-white/50' : 'text-text-dark/50'}`}>
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
                                    <ul className={`flex-1 space-y-3 text-sm mb-8 ${isMax ? 'text-white/80' : 'text-text-dark/70'}`}>
                                        {meta.features.map((feat) => (
                                            <li key={feat} className="flex items-start gap-2">
                                                <CheckIcon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isMax ? 'text-white/60' : 'text-secondary'}`} />
                                                {feat}
                                            </li>
                                        ))}
                                        {modelCount > 0 ? (
                                            <li className="flex items-start gap-2">
                                                <CheckIcon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isMax ? 'text-white/60' : 'text-secondary'}`} />
                                                {modelCount} model AI tersedia
                                            </li>
                                        ) : null}
                                    </ul>

                                    {/* Expanded details (full page mode only) */}
                                    {!compact && models.length > 0 ? (
                                        <div className={`mb-6 rounded-2xl p-4 ${isMax ? 'bg-white/5' : 'bg-slate-50'}`}>
                                            <p className={`text-[10px] uppercase tracking-[0.25em] font-semibold mb-3 ${isMax ? 'text-white/50' : 'text-text-dark/40'}`}>
                                                Model AI
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {models.map((m) => (
                                                    <span key={m} className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${isMax ? 'border-white/20 bg-white/10 text-white/80' : 'border-slate-200 bg-white text-text-dark/70'}`}>
                                                        {modelLabelMap[m] ?? m}
                                                    </span>
                                                ))}
                                            </div>
                                            {Object.keys(limits).length > 0 ? (
                                                <div className={`mt-3 pt-3 border-t space-y-1.5 ${isMax ? 'border-white/10' : 'border-slate-200'}`}>
                                                    <p className={`text-[10px] uppercase tracking-[0.25em] font-semibold mb-2 ${isMax ? 'text-white/50' : 'text-text-dark/40'}`}>
                                                        Kuota Harian
                                                    </p>
                                                    {Object.entries(limits).map(([key, val]) => (
                                                        <div key={key} className={`flex items-center justify-between text-xs ${isMax ? 'text-white/70' : 'text-text-dark/60'}`}>
                                                            <span>{modelLabelMap[key] ?? key}</span>
                                                            <span className={`font-semibold ${isMax ? 'text-white' : 'text-text-dark'}`}>
                                                                {val === null ? '∞' : typeof val === 'number' ? new Intl.NumberFormat('id-ID').format(val) + '/hari' : String(val)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className={`mt-2 text-[11px] ${isMax ? 'text-white/40' : 'text-text-dark/40'}`}>
                                                    Tanpa batas kuota
                                                </p>
                                            )}
                                        </div>
                                    ) : null}

                                    {/* CTA */}
                                    {isFree ? (
                                        <Link
                                            href="/register"
                                            className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-all shadow-sm ${meta.cta}`}
                                        >
                                            Mulai Gratis
                                        </Link>
                                    ) : price !== null ? (
                                        <Link
                                            href={`/payment?plan=${plan}&interval=${interval}`}
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
