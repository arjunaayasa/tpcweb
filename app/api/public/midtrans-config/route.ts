import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const SETTINGS_KEY = 'midtrans_settings';

/**
 * GET /api/public/midtrans-config
 * Returns only the client key and production flag (safe to expose to frontend).
 */
export async function GET() {
    try {
        const row = await prisma.siteSetting.findUnique({ where: { key: SETTINGS_KEY } });
        const s = row ? (row.value as { clientKey?: string; isProduction?: boolean }) : {};

        const clientKey = s.clientKey ?? process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '';
        const isProduction = s.isProduction ?? (process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true');

        return NextResponse.json({ clientKey, isProduction });
    } catch {
        return NextResponse.json({
            clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '',
            isProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true',
        });
    }
}
