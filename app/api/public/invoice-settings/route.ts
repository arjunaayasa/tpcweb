import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const SETTINGS_KEY = 'invoice_settings';

const defaultSettings = {
    companyName: 'PT TaxPrime',
    companyLogo: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: 'support@taxindo.ai',
    taxId: '',
    footerNote: 'Terima kasih telah menggunakan layanan kami.',
    taxEnabled: false,
    taxType: 'PPN',
    taxRate: 11,
    taxLabel: 'PPN 11%',
    taxIncluded: false,
    stampDutyEnabled: false,
    stampDutyThreshold: 5000000,
    stampDutyAmount: 10000,
    additionalTaxId: '',
    taxOffice: '',
    taxOfficerName: '',
};

/**
 * GET /api/public/invoice-settings
 * Public endpoint — returns only fields needed for checkout display.
 */
export async function GET() {
    try {
        const row = await prisma.siteSetting.findUnique({ where: { key: SETTINGS_KEY } });
        const s = row ? (row.value as typeof defaultSettings) : defaultSettings;

        return NextResponse.json({
            companyName: s.companyName,
            companyEmail: s.companyEmail,
            companyLogo: s.companyLogo,
            footerNote: s.footerNote,
            taxEnabled: s.taxEnabled,
            taxType: s.taxType,
            taxRate: s.taxRate,
            taxLabel: s.taxLabel,
            taxIncluded: s.taxIncluded,
            stampDutyEnabled: s.stampDutyEnabled,
            stampDutyThreshold: s.stampDutyThreshold,
            stampDutyAmount: s.stampDutyAmount,
        });
    } catch {
        return NextResponse.json(defaultSettings);
    }
}
