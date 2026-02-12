import { NextResponse } from 'next/server';
import { AUTH_BASE_URL } from '@/lib/sso';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const upstreamUrl = new URL('/api/public/plan-prices', AUTH_BASE_URL);
        const plan = url.searchParams.get('plan');
        const interval = url.searchParams.get('interval');
        const currency = url.searchParams.get('currency');

        if (plan) upstreamUrl.searchParams.set('plan', plan);
        if (interval) upstreamUrl.searchParams.set('interval', interval);
        if (currency) upstreamUrl.searchParams.set('currency', currency);

        const upstream = await fetch(upstreamUrl.toString(), {
            method: 'GET',
            headers: { accept: 'application/json' },
            cache: 'no-store',
        });

        const payload = await upstream.text();
        const response = new NextResponse(payload, { status: upstream.status });
        const contentType = upstream.headers.get('content-type');
        if (contentType) response.headers.set('content-type', contentType);
        return response;
    } catch {
        return NextResponse.json({ error: 'Auth service unavailable.' }, { status: 502 });
    }
}
