import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/sso';

export const runtime = 'nodejs';

const BILLING_API_KEY = process.env.BILLING_API_KEY ?? '';

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;

/**
 * Provisions an MNC/Group organization after a confirmed MNC payment.
 *
 * Proxies to the backend `POST /api/org/provision` using the same
 * server-to-server billing API key (`x-api-key: BILLING_API_KEY`) that
 * tpcweb already uses for plan billing calls. The buyer is resolved from
 * the SSO session so the org owner cannot be spoofed by the client.
 *
 * Body: { slug, name, interval? }
 */
export async function POST(request: Request) {
  try {
    const base = await getBackendUrl();
    const cookie = request.headers.get('cookie') ?? '';

    const body = (await request.json()) as {
      slug?: string;
      name?: string;
      interval?: string;
    };

    const slug = (body.slug ?? '').trim().toLowerCase();
    const name = (body.name ?? '').trim();
    const interval = body.interval === 'YEARLY' ? 'YEARLY' : 'MONTHLY';

    if (!slug || !SLUG_RE.test(slug)) {
      return NextResponse.json({ error: 'Slug organisasi tidak valid.' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: 'Nama organisasi wajib diisi.' }, { status: 400 });
    }

    // Resolve the buyer (org owner) from the SSO session.
    const profileRes = await fetch(`${base}/api/profile`, {
      headers: { cookie },
      cache: 'no-store',
    });
    if (!profileRes.ok) {
      return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
    }
    const profile = (await profileRes.json()) as {
      user?: { id?: string; email?: string; plan?: string | null };
    };
    const user = profile.user;
    if (!user?.id || !user?.email) {
      return NextResponse.json({ error: 'Profil pengguna tidak valid.' }, { status: 400 });
    }

    // Only MNC/Group accounts may provision an organization. This guards both the post-payment
    // checkout flow (plan is MNC by the time provision runs) and the no-payment setup path.
    if (user.plan !== 'MNC') {
      return NextResponse.json(
        { error: 'Portal organisasi hanya tersedia untuk paket MNC / Group.' },
        { status: 403 },
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      accept: 'application/json',
      cookie,
    };
    if (BILLING_API_KEY) headers['x-api-key'] = BILLING_API_KEY;

    const upstream = await fetch(`${base}/api/org/provision`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        slug,
        name,
        ownerUserId: user.id,
        ownerEmail: user.email,
        interval,
      }),
    });

    const payload = await upstream.text();

    if (upstream.status === 409) {
      return NextResponse.json(
        { error: `Slug "${slug}" sudah digunakan. Silakan pilih slug lain.` },
        { status: 409 },
      );
    }

    const response = new NextResponse(payload, { status: upstream.status });
    const contentType = upstream.headers.get('content-type');
    if (contentType) {
      response.headers.set('content-type', contentType);
    }
    return response;
  } catch {
    return NextResponse.json({ error: 'Layanan organisasi tidak tersedia.' }, { status: 502 });
  }
}
