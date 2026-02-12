import { prisma } from '@/lib/prisma';

/**
 * Generate the next invoice number in the format INV-YYYYMM-XXXX
 */
export async function generateInvoiceNumber(): Promise<string> {
    const now = new Date();
    const prefix = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

    const lastInvoice = await prisma.invoice.findFirst({
        where: { invoiceNumber: { startsWith: prefix } },
        orderBy: { invoiceNumber: 'desc' },
    });

    let seq = 1;
    if (lastInvoice) {
        const parts = lastInvoice.invoiceNumber.split('-');
        const lastSeq = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }

    return `${prefix}-${String(seq).padStart(4, '0')}`;
}

/**
 * Create an invoice record from a successful payment.
 */
export async function createInvoiceFromPayment(params: {
    orderId: string;
    userId: string;
    userEmail: string;
    plan: string;
    amount: number;
    interval?: string;
    paymentMethod?: string;
}) {
    // Guard: prevent duplicate invoice for the same order
    const existing = await prisma.invoice.findFirst({
        where: { orderId: params.orderId },
    });
    if (existing) {
        console.log(`[Invoice] Already exists for order ${params.orderId}: ${existing.invoiceNumber}`);
        return existing;
    }

    const invoiceNumber = await generateInvoiceNumber();

    const items = [
        {
            description: `Paket ${params.plan} (${params.interval === 'YEARLY' || params.interval === 'ANNUAL' ? 'Tahunan' : 'Bulanan'})`,
            quantity: 1,
            price: params.amount,
        },
    ];

    const invoice = await prisma.invoice.create({
        data: {
            invoiceNumber,
            orderId: params.orderId,
            userId: params.userId,
            userEmail: params.userEmail,
            status: 'PAID',
            amount: params.amount,
            plan: params.plan,
            interval: params.interval ?? 'MONTHLY',
            paidAt: new Date(),
            paymentMethod: params.paymentMethod ?? 'Midtrans',
            items,
        },
    });

    console.log(`[Invoice] Created: ${invoiceNumber} for order ${params.orderId}`);
    return invoice;
}
