import { NextResponse } from 'next/server';
import { AUTH_BASE_URL } from '@/lib/sso';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const upstreamUrl = new URL('/api/billing/plan-prices', AUTH_BASE_URL);
        const plan = url.searchParams.get('plan');
        const interval = url.searchParams.get('interval');
        const currency = url.searchParams.get('currency');

        if (plan) upstreamUrl.searchParams.set('plan', plan);
        if (interval) upstreamUrl.searchParams.set('interval', interval);
        if (currency) upstreamUrl.searchParams.set('currency', currency);

        const headers: Record<string, string> = { accept: 'application/json' };
        const cookie = request.headers.get('cookie');
        if (cookie) headers.cookie = cookie;
        const apiKey = process.env.BILLING_API_KEY;
        if (apiKey) headers['x-api-key'] = apiKey;

        const upstream = await fetch(upstreamUrl.toString(), {
            method: 'GET',
            headers,
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

export async function POST(request: Request) {
    try {
        const body = await request.text();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            accept: 'application/json',
        };
        const cookie = request.headers.get('cookie');
        if (cookie) headers.cookie = cookie;
        const apiKey = process.env.BILLING_API_KEY;
        if (apiKey) headers['x-api-key'] = apiKey;

        const upstream = await fetch(`${AUTH_BASE_URL}/api/billing/plan-prices`, {
            method: 'POST',
            headers,
            body,
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

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const upstreamUrl = new URL('/api/billing/plan-prices', AUTH_BASE_URL);
        const plan = url.searchParams.get('plan');
        const interval = url.searchParams.get('interval');
        const currency = url.searchParams.get('currency');

        if (plan) upstreamUrl.searchParams.set('plan', plan);
        if (interval) upstreamUrl.searchParams.set('interval', interval);
        if (currency) upstreamUrl.searchParams.set('currency', currency);

        const headers: Record<string, string> = { accept: 'application/json' };
        const cookie = request.headers.get('cookie');
        if (cookie) headers.cookie = cookie;
        const apiKey = process.env.BILLING_API_KEY;
        if (apiKey) headers['x-api-key'] = apiKey;

        const upstream = await fetch(upstreamUrl.toString(), {
            method: 'DELETE',
            headers,
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
