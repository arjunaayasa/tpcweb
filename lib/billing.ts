export type BillingCycle = 'MONTHLY' | 'ANNUAL';

export const normalizeCycle = (value: unknown): BillingCycle | null => {
    if (!value) return null;
    const text = String(value).toLowerCase();
    if (text.includes('year') || text.includes('annual') || text.includes('tahun')) return 'ANNUAL';
    if (text.includes('month') || text.includes('monthly') || text.includes('bulan')) return 'MONTHLY';
    return null;
};

export const getPlanCycle = (
    plan: { limits?: Record<string, unknown> | null } | null | undefined,
): BillingCycle => {
    const limits = (plan?.limits ?? undefined) as Record<string, unknown> | undefined;
    const candidates = [
        limits?.billingCycle,
        limits?.billing_interval,
        limits?.billingInterval,
        limits?.interval,
        limits?.period,
        limits?.cycle,
    ];

    for (const candidate of candidates) {
        const normalized = normalizeCycle(candidate);
        if (normalized) return normalized;
    }

    return 'MONTHLY';
};

export const addMonths = (date: Date, months: number) => {
    const base = new Date(date);
    const day = base.getDate();
    base.setDate(1);
    base.setMonth(base.getMonth() + months);
    const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    base.setDate(Math.min(day, lastDay));
    return base;
};

export const getBillingWindow = (start: Date, cycle: BillingCycle, now: Date) => {
    const increment = cycle === 'ANNUAL' ? 12 : 1;
    let currentStart = new Date(start);
    let next = addMonths(currentStart, increment);

    while (next <= now) {
        currentStart = next;
        next = addMonths(currentStart, increment);
    }

    return { currentStart, next };
};

export const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
