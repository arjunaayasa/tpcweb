import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/sso';
import { createInvoiceFromPayment } from '@/lib/invoice';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const BILLING_API_KEY = process.env.BILLING_API_KEY ?? '';

async function getMidtransConfig() {
    try {
        const row = await prisma.siteSetting.findUnique({ where: { key: 'midtrans_settings' } });
        if (row?.value) {
            const s = row.value as { serverKey?: string; clientKey?: string; isProduction?: boolean };
            if (s.serverKey) {
                return { serverKey: s.serverKey, isProduction: s.isProduction ?? false };
            }
        }
    } catch { /* fall through to env */ }
    return {
        serverKey: process.env.MIDTRANS_SERVER_KEY ?? '',
        isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    };
}

/**
 * Client-side verification endpoint.
 * Called after Snap.js onSuccess to verify payment and upgrade plan.
 * Also creates an invoice record.
 */
export async function POST(request: Request) {
    try {
        const { serverKey, isProduction } = await getMidtransConfig();
        const STATUS_URL = isProduction
            ? 'https://api.midtrans.com/v2'
            : 'https://api.sandbox.midtrans.com/v2';

        if (!serverKey) {
            return NextResponse.json({ error: 'Payment gateway not configured.' }, { status: 500 });
        }

        const cookie = request.headers.get('cookie') ?? '';
        const body = (await request.json()) as {
            order_id: string;
            plan?: string;
        };

        const { order_id, plan } = body;
        if (!order_id) {
            return NextResponse.json({ error: 'order_id wajib diisi.' }, { status: 400 });
        }
        if (!plan) {
            return NextResponse.json({ error: 'plan wajib diisi.' }, { status: 400 });
        }

        // 1. Verify transaction status with Midtrans
        const auth = Buffer.from(`${serverKey}:`).toString('base64');
        const statusRes = await fetch(`${STATUS_URL}/${order_id}/status`, {
            headers: {
                Accept: 'application/json',
                Authorization: `Basic ${auth}`,
            },
        });

        if (!statusRes.ok) {
            return NextResponse.json({ error: 'Gagal memverifikasi pembayaran.' }, { status: 502 });
        }

        const statusData = (await statusRes.json()) as {
            transaction_status?: string;
            fraud_status?: string;
            order_id?: string;
            gross_amount?: string;
            payment_type?: string;
        };

        const isSettled =
            statusData.transaction_status === 'settlement' ||
            (statusData.transaction_status === 'capture' && statusData.fraud_status === 'accept');

        if (!isSettled) {
            return NextResponse.json({
                error: 'Pembayaran belum berhasil.',
                transaction_status: statusData.transaction_status,
            }, { status: 400 });
        }

        // 2. Get user profile to identify who to upgrade
        const base = await getBackendUrl();
        const profileRes = await fetch(`${base}/api/profile`, {
            headers: { cookie },
            cache: 'no-store',
        });

        if (!profileRes.ok) {
            return NextResponse.json({ error: 'Session tidak valid.' }, { status: 401 });
        }

        const profile = (await profileRes.json()) as {
            user?: { id?: string; email?: string };
        };
        const user = profile.user;

        if (!user?.email) {
            return NextResponse.json({ error: 'Profil pengguna tidak valid.' }, { status: 400 });
        }

        // 3. Upgrade plan via billing API
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            accept: 'application/json',
            cookie,
        };
        if (BILLING_API_KEY) headers['x-api-key'] = BILLING_API_KEY;

        {
            const changePlanPayload = { plan, email: user.email, userId: user.id };
            const changeRes = await fetch(`${base}/api/billing/change-plan`, {
                method: 'POST',
                headers,
                body: JSON.stringify(changePlanPayload),
            });
            if (!changeRes.ok) {
                const errText = await changeRes.text();
                console.error('[Payment] Failed to change plan:', errText);
                return NextResponse.json({ error: 'Gagal mengupgrade paket.' }, { status: 502 });
            }
        }

        // 4. Create invoice record
        let invoiceId: string | null = null;
        try {
            const amount = parseInt(statusData.gross_amount ?? '0', 10);
            const intervalMatch = order_id.match(/-(MONTHLY|YEARLY|ANNUAL)/i);
            const interval = intervalMatch ? intervalMatch[1].toUpperCase() : 'MONTHLY';

            const invoice = await createInvoiceFromPayment({
                orderId: order_id,
                userId: user.id ?? '',
                userEmail: user.email,
                plan: plan ?? '',
                amount,
                interval,
                paymentMethod: statusData.payment_type ?? 'Midtrans',
            });
            invoiceId = invoice.id;
        } catch (invoiceErr) {
            console.error('[Payment] Invoice creation failed:', invoiceErr);
        }

        return NextResponse.json({ status: 'ok', plan, type: 'plan', invoiceId });
    } catch (err) {
        console.error('[Payment] Verify error:', err);
        return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
    }
}

