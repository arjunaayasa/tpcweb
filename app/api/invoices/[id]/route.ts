import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchAuthMe } from '@/lib/sso';

export const runtime = 'nodejs';

/**
 * GET /api/invoices/[id]
 * Returns a specific invoice. User must own the invoice.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const user = await fetchAuthMe(request.headers.get('cookie'));

        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const invoice = await prisma.invoice.findUnique({ where: { id } });

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });
        }

        if (invoice.userId !== user.id && user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
        }

        return NextResponse.json({ invoice });
    } catch (err) {
        console.error('[Invoices] GET [id] error:', err);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
