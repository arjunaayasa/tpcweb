import { NextResponse } from 'next/server';
import { AUTH_BASE_URL } from '@/lib/sso';
import { createInvoiceFromPayment } from '@/lib/invoice';

export const runtime = 'nodejs';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? '';
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const STATUS_URL = IS_PRODUCTION
    ? 'https://api.midtrans.com/v2'
    : 'https://api.sandbox.midtrans.com/v2';
const BILLING_API_KEY = process.env.BILLING_API_KEY ?? '';

/**
 * Client-side verification endpoint.
 * Called after Snap.js onSuccess to verify payment and upgrade plan.
 * Also creates an invoice record.
 */
export async function POST(request: Request) {
    try {
        if (!MIDTRANS_SERVER_KEY) {
            return NextResponse.json({ error: 'Payment gateway not configured.' }, { status: 500 });
        }

        const cookie = request.headers.get('cookie') ?? '';
        const body = (await request.json()) as {
            order_id: string;
            plan: string;
        };

        const { order_id, plan } = body;
        if (!order_id || !plan) {
            return NextResponse.json({ error: 'order_id dan plan wajib diisi.' }, { status: 400 });
        }

        // 1. Verify transaction status with Midtrans
        const auth = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');
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
        const profileRes = await fetch(`${AUTH_BASE_URL}/api/profile`, {
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
        const changePlanPayload = { plan, email: user.email, userId: user.id };
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            accept: 'application/json',
            cookie,
        };
        if (BILLING_API_KEY) headers['x-api-key'] = BILLING_API_KEY;

        const changeRes = await fetch(`${AUTH_BASE_URL}/api/billing/change-plan`, {
            method: 'POST',
            headers,
            body: JSON.stringify(changePlanPayload),
        });

        if (!changeRes.ok) {
            const errText = await changeRes.text();
            console.error('[Payment] Failed to change plan:', errText);
            return NextResponse.json({ error: 'Gagal mengupgrade paket.' }, { status: 502 });
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
                plan,
                amount,
                interval,
                paymentMethod: statusData.payment_type ?? 'Midtrans',
            });
            invoiceId = invoice.id;
        } catch (invoiceErr) {
            console.error('[Payment] Invoice creation failed:', invoiceErr);
        }

        return NextResponse.json({ status: 'ok', plan, invoiceId });
    } catch (err) {
        console.error('[Payment] Verify error:', err);
        return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
    }
}

