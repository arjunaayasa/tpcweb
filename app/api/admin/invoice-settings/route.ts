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
    taxId: string; // NPWP Perusahaan
    footerNote: string;
    // Pengaturan Pajak Invoice
    taxEnabled: boolean;          // aktifkan pajak di invoice
    taxType: string;              // jenis pajak: PPN, PPh, Bebas
    taxRate: number;              // tarif pajak dalam persen, misal 11 untuk 11%
    taxLabel: string;             // label pajak di invoice, misal "PPN 11%"
    taxIncluded: boolean;         // harga sudah termasuk pajak (inclusive) atau ditambahkan (exclusive)
    stampDutyEnabled: boolean;    // aktifkan bea meterai
    stampDutyThreshold: number;   // batas nilai invoice (IDR) untuk dikenakan bea meterai
    stampDutyAmount: number;      // nominal bea meterai (IDR)
    additionalTaxId: string;      // PKP / nomor pengukuhan PKP (opsional)
    taxOffice: string;            // KPP / kantor pajak terdaftar
    taxOfficerName: string;       // nama penanggung jawab pajak
};

const defaultSettings: InvoiceSettingsData = {
    companyName: 'PT TaxPrime',
    companyLogo: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: 'support@taxindo.ai',
    taxId: '',
    footerNote: 'Terima kasih telah menggunakan layanan kami.',
    // Pajak
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
