import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchAuthMe } from '@/lib/sso';

export const runtime = 'nodejs';

/**
 * GET /api/invoices
 * Returns invoices for the authenticated user.
 */
export async function GET(request: Request) {
    try {
        const user = await fetchAuthMe(request.headers.get('cookie'));

        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const invoices = await prisma.invoice.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ invoices });
    } catch (err) {
        console.error('[Invoices] GET error:', err);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
