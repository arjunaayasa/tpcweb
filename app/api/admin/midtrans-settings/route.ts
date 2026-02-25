import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/sso';

export const runtime = 'nodejs';

const SETTINGS_KEY = 'midtrans_settings';

export type MidtransSettingsData = {
    serverKey: string;
    clientKey: string;
    isProduction: boolean;
};

const defaultSettings: MidtransSettingsData = {
    serverKey: '',
    clientKey: '',
    isProduction: false,
};

export async function GET(request: Request) {
    const admin = await requireAdminFromRequest(request);
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const row = await prisma.siteSetting.findUnique({ where: { key: SETTINGS_KEY } });
    const settings = row ? (row.value as MidtransSettingsData) : defaultSettings;

    return NextResponse.json({ settings });
}

export async function POST(request: Request) {
    const admin = await requireAdminFromRequest(request);
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as Partial<MidtransSettingsData>;

    const current = await prisma.siteSetting.findUnique({ where: { key: SETTINGS_KEY } });
    const current_settings = current ? (current.value as MidtransSettingsData) : defaultSettings;

    const updated: MidtransSettingsData = {
        ...current_settings,
        ...body,
    };

    await prisma.siteSetting.upsert({
        where: { key: SETTINGS_KEY },
        create: { key: SETTINGS_KEY, value: updated as object },
        update: { value: updated as object },
    });

    return NextResponse.json({ settings: updated });
}
