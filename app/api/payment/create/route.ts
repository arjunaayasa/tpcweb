import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/sso';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const MIDTRANS_SETTINGS_KEY = 'midtrans_settings';

async function getMidtransConfig() {
    try {
        const row = await prisma.siteSetting.findUnique({ where: { key: MIDTRANS_SETTINGS_KEY } });
        if (row?.value) {
            const s = row.value as { serverKey?: string; clientKey?: string; isProduction?: boolean };
            if (s.serverKey) {
                return {
                    serverKey: s.serverKey,
                    isProduction: s.isProduction ?? false,
                };
            }
        }
    } catch { /* fall through to env */ }
    return {
        serverKey: process.env.MIDTRANS_SERVER_KEY ?? '',
        isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    };
}

export async function POST(request: Request) {
    try {
        const { serverKey, isProduction } = await getMidtransConfig();
        const SNAP_URL = isProduction
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        if (!serverKey) {
            return NextResponse.json({ error: 'Payment gateway not configured.' }, { status: 500 });
        }

        const cookie = request.headers.get('cookie') ?? '';

        // 1. Get user profile from auth service
        const base = await getBackendUrl();
        const profileRes = await fetch(`${base}/api/profile`, {
            headers: { cookie },
            cache: 'no-store',
        });

        if (!profileRes.ok) {
            return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
        }

        const profile = (await profileRes.json()) as {
            user?: { id?: string; email?: string; name?: string; plan?: string };
        };
        const user = profile.user;

        if (!user?.id || !user?.email) {
            return NextResponse.json({ error: 'Profil pengguna tidak valid.' }, { status: 400 });
        }

        // 2. Parse request body
        const body = (await request.json()) as {
            type?: 'plan';
            plan?: string;
            interval: string;
        };
        const { plan, interval } = body;

        if (!interval) {
            return NextResponse.json({ error: 'Interval wajib diisi.' }, { status: 400 });
        }

        if (!plan) {
            return NextResponse.json({ error: 'Plan wajib diisi.' }, { status: 400 });
        }

        if (user.plan === plan) {
            return NextResponse.json({ error: 'Anda sudah menggunakan paket ini.' }, { status: 400 });
        }

        // 3. Get plan price from prices API
        let planPriceAmount = 0;
        let currency = 'IDR';

        {
            const priceRes = await fetch(
                `${base}/api/public/plan-prices?plan=${plan}&interval=${interval}`,
                { cache: 'no-store' },
            );
            if (!priceRes.ok) {
                return NextResponse.json({ error: 'Gagal memuat harga paket.' }, { status: 502 });
            }
            const priceData = (await priceRes.json()) as {
                prices: Array<{ plan: string; interval: string; amount: number; currency: string }>;
            };
            const matched = priceData.prices?.find(
                (p) => p.plan === plan && p.interval === interval,
            );
            if (!matched || matched.amount <= 0) {
                return NextResponse.json({ error: 'Harga paket belum tersedia.' }, { status: 404 });
            }
            planPriceAmount = matched.amount;
            currency = matched.currency;
        }

        const grossAmount = planPriceAmount;
        if (grossAmount <= 0) {
            return NextResponse.json({ error: 'Harga belum tersedia.' }, { status: 404 });
        }

        // 3b. Fetch invoice/tax settings
        const INVOICE_SETTINGS_KEY = 'invoice_settings';
        type InvoiceTaxSettings = {
            taxEnabled?: boolean;
            taxRate?: number;
            taxLabel?: string;
            taxIncluded?: boolean;
            stampDutyEnabled?: boolean;
            stampDutyThreshold?: number;
            stampDutyAmount?: number;
        };
        let taxSettings: InvoiceTaxSettings = {};
        try {
            const taxRow = await prisma.siteSetting.findUnique({ where: { key: INVOICE_SETTINGS_KEY } });
            if (taxRow?.value) taxSettings = taxRow.value as InvoiceTaxSettings;
        } catch { /* use defaults (no tax) */ }

        const taxEnabled = taxSettings.taxEnabled ?? false;
        const taxIncluded = taxSettings.taxIncluded ?? false;
        const taxRate = taxSettings.taxRate ?? 0;
        const taxLabel = taxSettings.taxLabel ?? 'Pajak';
        const stampDutyEnabled = taxSettings.stampDutyEnabled ?? false;
        const stampDutyThreshold = taxSettings.stampDutyThreshold ?? 5000000;
        const stampDutyAmount = taxSettings.stampDutyAmount ?? 10000;

        const taxAmount = taxEnabled && !taxIncluded && taxRate > 0
            ? Math.round(grossAmount * taxRate / 100)
            : 0;
        const stampDuty = stampDutyEnabled && grossAmount >= stampDutyThreshold
            ? stampDutyAmount
            : 0;
        const finalGrossAmount = grossAmount + taxAmount + stampDuty;

        // 4. Build Midtrans Snap request
        const orderId = `TPC-${plan}-${user.id.slice(0, 8)}-${Date.now()}`;

        const itemDetails: Array<{ id: string; price: number; quantity: number; name: string }> = [];

        if (planPriceAmount > 0) {
            itemDetails.push({
                id: `${plan}-${interval}`,
                price: planPriceAmount,
                quantity: 1,
                name: `Paket ${plan} (${interval === 'MONTHLY' ? 'Bulanan' : 'Tahunan'})`,
            });
        }

        if (taxAmount > 0) {
            itemDetails.push({
                id: 'tax',
                price: taxAmount,
                quantity: 1,
                name: taxLabel,
            });
        }

        if (stampDuty > 0) {
            itemDetails.push({
                id: 'stamp-duty',
                price: stampDuty,
                quantity: 1,
                name: 'Bea Meterai',
            });
        }

        const snapPayload = {
            transaction_details: {
                order_id: orderId,
                gross_amount: finalGrossAmount,
            },
            item_details: itemDetails,
            customer_details: {
                first_name: user.name ?? user.email.split('@')[0],
                email: user.email,
            },
            // Store metadata for webhook processing
            custom_field1: user.id,
            custom_field2: plan,
            custom_field3: user.email,
        };

        // 5. Call Midtrans Snap API
        const auth = Buffer.from(`${serverKey}:`).toString('base64');

        const snapRes = await fetch(SNAP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify(snapPayload),
        });

        const snapData = (await snapRes.json()) as {
            token?: string;
            redirect_url?: string;
            error_messages?: string[];
        };

        if (!snapRes.ok || !snapData.token) {
            console.error('[Midtrans] Snap error:', snapData);
            return NextResponse.json(
                { error: 'Gagal membuat transaksi pembayaran.', details: snapData.error_messages },
                { status: 502 },
            );
        }

        return NextResponse.json({
            token: snapData.token,
            redirect_url: snapData.redirect_url,
            order_id: orderId,
        });
    } catch (err) {
        console.error('[Payment] Create error:', err);
        return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
    }
}
