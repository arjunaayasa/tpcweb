import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { fetchAuthProfile, getBackendUrl } from '@/lib/sso';
import { saveKycFile } from '@/lib/kyc-storage';

export const runtime = 'nodejs';

const MAX_FILE_BYTES = 10 * 1024 * 1024; // ~10MB

// Allowed upload mime types → stored file extension.
const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

/**
 * KYC submission (multipart/form-data).
 *
 * tpcweb (taxindo.ai) is the canonical store for KYC images — files live on this server's disk
 * (aaPanel), NOT on the portal/backend. Flow:
 *   1. Parse the upload and validate the file (type/size).
 *   2. Resolve the authenticated user id (backend `/api/profile`, cookie forwarded).
 *   3. Save the image locally under `{KYC_STORAGE_DIR}/{userId}/{uuid}{ext}`.
 *   4. Forward the bytes + the stored `imagePath` to the backend `POST /api/kyc/submit`, which
 *      runs OCR/adjudication on the in-memory bytes and records the decision + path (no disk write).
 *   5. Return the backend response verbatim.
 */
export async function POST(request: Request) {
  const cookie = request.headers.get('cookie');

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'Format unggahan tidak valid. Gunakan multipart/form-data.' },
      { status: 400 },
    );
  }

  const file = form.get('image');
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'Berkas dokumen wajib diunggah pada kolom "image".' },
      { status: 400 },
    );
  }

  const ext = ALLOWED_MIME[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: 'Tipe berkas tidak didukung. Unggah gambar JPG, PNG, WEBP, atau PDF.' },
      { status: 400 },
    );
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: 'Berkas kosong.' }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: 'Ukuran berkas melebihi batas 10MB.' }, { status: 400 });
  }

  // Resolve the authenticated user so we can store under their folder.
  const profile = await fetchAuthProfile(cookie);
  const userId = profile?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Save to tpcweb's own disk and capture the stored path for backend traceability.
  let imagePath: string;
  try {
    imagePath = await saveKycFile(userId, randomUUID(), buffer, ext);
  } catch {
    return NextResponse.json({ error: 'Gagal menyimpan berkas KYC.' }, { status: 500 });
  }

  // Forward bytes + the frontend-owned path to the backend pipeline.
  try {
    const base = await getBackendUrl();
    const forward = new FormData();
    forward.append('image', new Blob([buffer], { type: file.type }), file.name || `kyc${ext}`);
    forward.append('imagePath', imagePath);

    const upstream = await fetch(`${base}/api/kyc/submit`, {
      method: 'POST',
      headers: {
        cookie: cookie ?? '',
        accept: 'application/json',
      },
      body: forward,
    });

    const payload = await upstream.text();
    const response = new NextResponse(payload, { status: upstream.status });
    const resContentType = upstream.headers.get('content-type');
    if (resContentType) {
      response.headers.set('content-type', resContentType);
    }
    return response;
  } catch {
    return NextResponse.json({ error: 'Layanan KYC tidak tersedia.' }, { status: 502 });
  }
}
