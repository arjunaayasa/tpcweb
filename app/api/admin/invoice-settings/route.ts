import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/sso';

export const runtime = 'nodejs';

const SETTINGS_KEY = 'invoice_settings';

export type InvoiceSettingsData = {
    companyName: string;
    companyLogo: string;
    companyAddress: string;
    companyPhone: string;
    companyEmail: string;
    taxId: string;
    footerNote: string;
};

const defaultSettings: InvoiceSettingsData = {
    companyName: 'PT TaxPrime',
    companyLogo: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: 'support@taxindo.ai',
    taxId: '',
    footerNote: 'Terima kasih telah menggunakan layanan kami.',
};

/**
 * GET /api/admin/invoice-settings
 */
export async function GET(request: Request) {
    const admin = await requireAdminFromRequest(request);
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const row = await prisma.siteSetting.findUnique({ where: { key: SETTINGS_KEY } });
    const settings = row ? (row.value as InvoiceSettingsData) : defaultSettings;

    return NextResponse.json({ settings });
}

/**
 * POST /api/admin/invoice-settings
 */
export async function POST(request: Request) {
    const admin = await requireAdminFromRequest(request);
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as Partial<InvoiceSettingsData>;

    const current = await prisma.siteSetting.findUnique({ where: { key: SETTINGS_KEY } });
    const currentSettings = current ? (current.value as InvoiceSettingsData) : defaultSettings;

    const updated: InvoiceSettingsData = {
        ...currentSettings,
        ...body,
    };

    await prisma.siteSetting.upsert({
        where: { key: SETTINGS_KEY },
        create: { key: SETTINGS_KEY, value: updated as object },
        update: { value: updated as object },
    });

    return NextResponse.json({ settings: updated });
}
