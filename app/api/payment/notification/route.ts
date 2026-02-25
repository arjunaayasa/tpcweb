import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/sso';
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

        // 3. Upgrade user plan and/or activate addon
        // custom_field2 format:
        //   "UMKM"            → plan-only purchase
        //   "addon:PRO"       → addon-only purchase
        //   "UMKM+addon:PRO"  → combined plan + addon purchase
        const isCombined = plan?.includes('+addon:');
        const isAddonOnly = !isCombined && plan?.startsWith('addon:');

        let planName: string | null = null;
        let addonName: string | null = null;

        if (isCombined) {
            const parts = plan!.split('+addon:');
            planName = parts[0];
            addonName = parts[1];
        } else if (isAddonOnly) {
            addonName = plan!.replace('addon:', '');
        } else {
            planName = plan ?? null;
        }

        if (!planName && !addonName) {
            console.error('[Midtrans] Missing plan/addon info in notification:', body);
            return NextResponse.json({ error: 'Missing plan or addon info.' }, { status: 400 });
        }
        if (!userId && !email) {
            console.error('[Midtrans] Missing user info in notification:', body);
            return NextResponse.json({ error: 'Missing user info.' }, { status: 400 });
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            accept: 'application/json',
        };
        if (BILLING_API_KEY) headers['x-api-key'] = BILLING_API_KEY;

        const base = await getBackendUrl();

        // Activate plan if applicable
        if (planName) {
            const changePlanPayload: Record<string, string> = { plan: planName };
            if (email) changePlanPayload.email = email;
            if (userId) changePlanPayload.userId = userId;

            const changeRes = await fetch(`${base}/api/billing/change-plan`, {
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

            console.log(`[Midtrans] Plan upgraded: user=${email ?? userId} → ${planName} (order=${order_id})`);
        }

        // Activate addon if applicable
        if (addonName) {
            const intervalMatch = order_id?.match(/-(MONTHLY|YEARLY|ANNUAL)/i);
            const parsedInterval = intervalMatch ? intervalMatch[1].toUpperCase() : 'MONTHLY';

            const changeAddonPayload: Record<string, string> = {
                addon: addonName,
                interval: parsedInterval === 'ANNUAL' ? 'YEARLY' : parsedInterval,
            };
            if (email) changeAddonPayload.email = email;
            if (userId) changeAddonPayload.userId = userId;

            const changeRes = await fetch(`${base}/api/billing/change-ai-addon`, {
                method: 'POST',
                headers,
                body: JSON.stringify(changeAddonPayload),
            });

            if (!changeRes.ok) {
                const errText = await changeRes.text();
                console.error('[Midtrans] Failed to activate addon:', errText);
                return NextResponse.json(
                    { error: 'Failed to activate addon.', details: errText },
                    { status: 502 },
                );
            }

            console.log(`[Midtrans] Addon activated: user=${email ?? userId} → ${addonName} (order=${order_id})`);
        }

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
                plan: isCombined ? `${planName}+AI-${addonName}` : addonName ? `AI-${addonName}` : (planName ?? ''),
                amount,
                interval,
                paymentMethod: 'Midtrans',
            });
        } catch (invoiceErr) {
            // Log but don't fail the webhook
            console.error('[Midtrans] Invoice creation failed:', invoiceErr);
        }

        const parts: string[] = [];
        if (planName) parts.push(`Plan: ${planName}`);
        if (addonName) parts.push(`Addon: ${addonName}`);
        return NextResponse.json({ status: 'ok', message: parts.join(', ') });
    } catch (err) {
        console.error('[Midtrans] Notification error:', err);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
