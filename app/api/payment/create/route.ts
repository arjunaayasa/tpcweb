import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/sso';

export const runtime = 'nodejs';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? '';
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const SNAP_URL = IS_PRODUCTION
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

export async function POST(request: Request) {
    try {
        if (!MIDTRANS_SERVER_KEY) {
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
        const body = (await request.json()) as { plan: string; interval: string };
        const { plan, interval } = body;

        if (!plan || !interval) {
            return NextResponse.json({ error: 'Plan dan interval wajib diisi.' }, { status: 400 });
        }

        if (user.plan === plan) {
            return NextResponse.json({ error: 'Anda sudah menggunakan paket ini.' }, { status: 400 });
        }

        // 3. Get price from plan-prices API
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

        const matchedPrice = priceData.prices?.find(
            (p) => p.plan === plan && p.interval === interval,
        );

        if (!matchedPrice || matchedPrice.amount <= 0) {
            return NextResponse.json({ error: 'Harga untuk paket ini belum tersedia.' }, { status: 404 });
        }

        // 4. Build Midtrans Snap request
        const orderId = `TPC-${plan}-${user.id.slice(0, 8)}-${Date.now()}`;
        const grossAmount = matchedPrice.amount;

        const snapPayload = {
            transaction_details: {
                order_id: orderId,
                gross_amount: grossAmount,
            },
            item_details: [
                {
                    id: `${plan}-${interval}`,
                    price: grossAmount,
                    quantity: 1,
                    name: `Paket ${plan} (${interval === 'MONTHLY' ? 'Bulanan' : 'Tahunan'})`,
                },
            ],
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
        const auth = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');

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
