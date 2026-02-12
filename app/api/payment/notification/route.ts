import { NextResponse } from 'next/server';
import { AUTH_BASE_URL } from '@/lib/sso';
import { createInvoiceFromPayment } from '@/lib/invoice';
import crypto from 'crypto';

export const runtime = 'nodejs';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? '';
const BILLING_API_KEY = process.env.BILLING_API_KEY ?? '';

/**
 * Midtrans notification webhook handler.
 * Verifies signature, then upgrades user plan on successful payment.
 *
 * Signature = SHA512(order_id + status_code + gross_amount + server_key)
 */
export async function POST(request: Request) {
    try {
        const body = (await request.json()) as {
            order_id?: string;
            status_code?: string;
            gross_amount?: string;
            signature_key?: string;
            transaction_status?: string;
            fraud_status?: string;
            custom_field1?: string; // userId
            custom_field2?: string; // plan
            custom_field3?: string; // email
        };

        const {
            order_id,
            status_code,
            gross_amount,
            signature_key,
            transaction_status,
            fraud_status,
            custom_field1: userId,
            custom_field2: plan,
            custom_field3: email,
        } = body;

        // 1. Verify signature
        if (MIDTRANS_SERVER_KEY && signature_key) {
            const expected = crypto
                .createHash('sha512')
                .update(`${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`)
                .digest('hex');

            if (expected !== signature_key) {
                console.error('[Midtrans] Invalid signature for order:', order_id);
                return NextResponse.json({ error: 'Invalid signature.' }, { status: 403 });
            }
        }

        console.log(`[Midtrans] Notification: order=${order_id} status=${transaction_status} fraud=${fraud_status}`);

        // 2. Check if payment is successful
        const isSettled =
            transaction_status === 'settlement' ||
            (transaction_status === 'capture' && fraud_status === 'accept');

        if (!isSettled) {
            // Non-settlement notifications (pending, deny, expire, cancel) — just acknowledge
            return NextResponse.json({ status: 'ok', message: `Status: ${transaction_status}` });
        }

        // 3. Upgrade user plan
        if (!plan || (!userId && !email)) {
            console.error('[Midtrans] Missing plan or user info in notification:', body);
            return NextResponse.json({ error: 'Missing plan or user info.' }, { status: 400 });
        }

        const changePlanPayload: Record<string, string> = { plan };
        if (email) changePlanPayload.email = email;
        if (userId) changePlanPayload.userId = userId;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            accept: 'application/json',
        };
        if (BILLING_API_KEY) headers['x-api-key'] = BILLING_API_KEY;

        const changeRes = await fetch(`${AUTH_BASE_URL}/api/billing/change-plan`, {
            method: 'POST',
            headers,
            body: JSON.stringify(changePlanPayload),
        });

        if (!changeRes.ok) {
            const errText = await changeRes.text();
            console.error('[Midtrans] Failed to change plan:', errText);
            return NextResponse.json(
                { error: 'Failed to upgrade plan.', details: errText },
                { status: 502 },
            );
        }

        console.log(`[Midtrans] ✅ Plan upgraded: user=${email ?? userId} → ${plan} (order=${order_id})`);

        // 4. Create invoice record
        try {
            const amount = parseInt(gross_amount ?? '0', 10);
            // Derive interval from order_id or default to MONTHLY
            const intervalMatch = order_id?.match(/-(MONTHLY|YEARLY|ANNUAL)/i);
            const interval = intervalMatch ? intervalMatch[1].toUpperCase() : 'MONTHLY';

            await createInvoiceFromPayment({
                orderId: order_id ?? '',
                userId: userId ?? '',
                userEmail: email ?? '',
                plan: plan ?? '',
                amount,
                interval,
                paymentMethod: 'Midtrans',
            });
        } catch (invoiceErr) {
            // Log but don't fail the webhook
            console.error('[Midtrans] Invoice creation failed:', invoiceErr);
        }

        return NextResponse.json({ status: 'ok', message: `Plan upgraded to ${plan}` });
    } catch (err) {
        console.error('[Midtrans] Notification error:', err);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
