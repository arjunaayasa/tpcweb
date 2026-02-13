import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { requireAdminFromRequest } from '@/lib/sso';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        // 1. Check for Admin Auth
        const admin = await requireAdminFromRequest(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Form Data
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
        }

        // 3. Process File
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 4. Ensure Upload Directory Exists
        const uploadDir = join(process.cwd(), 'public/uploads');
        await mkdir(uploadDir, { recursive: true });

        // 5. Generate Unique Filename
        // Sanitize filename: remove spaces and special chars, keep dots and alphanumeric
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = `${uniqueSuffix}-${originalName}`;
        const filePath = join(uploadDir, filename);

        // 6. Write File
        await writeFile(filePath, buffer);

        // 7. Return URL
        const url = `/uploads/${filename}`;
        return NextResponse.json({ success: true, url });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
