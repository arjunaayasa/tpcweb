import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { fetchAuthProfile } from '@/lib/sso';
import { getSiteSettings } from '@/lib/site-settings';

type BillingCycle = 'MONTHLY' | 'ANNUAL';

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);

const normalizeCycle = (value: unknown): BillingCycle | null => {
  if (!value) return null;
  const text = String(value).toLowerCase();
  if (text.includes('year') || text.includes('annual') || text.includes('tahun')) return 'ANNUAL';
  if (text.includes('month') || text.includes('monthly') || text.includes('bulan')) return 'MONTHLY';
  return null;
};

const getPlanCycle = (
  plan: { limits?: Record<string, unknown> | null } | null | undefined,
): BillingCycle => {
  const limits = (plan?.limits ?? undefined) as Record<string, unknown> | undefined;
  const candidates = [
    limits?.billingCycle,
    limits?.billing_interval,
    limits?.billingInterval,
    limits?.interval,
    limits?.period,
    limits?.cycle,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeCycle(candidate);
    if (normalized) return normalized;
  }

  return 'MONTHLY';
};

const addMonths = (date: Date, months: number) => {
  const base = new Date(date);
  const day = base.getDate();
  base.setDate(1);
  base.setMonth(base.getMonth() + months);
  const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  base.setDate(Math.min(day, lastDay));
  return base;
};

const getBillingWindow = (start: Date, cycle: BillingCycle, now: Date) => {
  const increment = cycle === 'ANNUAL' ? 12 : 1;
  let currentStart = new Date(start);
  let next = addMonths(currentStart, increment);

  while (next <= now) {
    currentStart = next;
    next = addMonths(currentStart, increment);
  }

  return { currentStart, next };
};

export default async function ManageSubscriptionsPage() {
  const headerList = await headers();
  const profile = await fetchAuthProfile(headerList.get('cookie'));

  if (!profile?.user) {
    redirect('/login');
  }

  const settings = await getSiteSettings(['footer']);
  const { user, plan } = profile;

  const cycle = getPlanCycle(plan ?? null);
  const now = new Date();
  const startDate = user.createdAt ? new Date(user.createdAt) : now;
  const { currentStart, next } = getBillingWindow(startDate, cycle, now);

  const periodLabel = `${formatDate(currentStart)} - ${formatDate(next)}`;
  const cycleLabel = cycle === 'ANNUAL' ? 'Tahunan' : 'Bulanan';
  const cycleDesc = cycle === 'ANNUAL' ? 'Ditagih per tahun' : 'Ditagih per bulan';

  const invoices: Array<{ id: string; period: string; billedAt: string; status: string }> = [];
  const increment = cycle === 'ANNUAL' ? 12 : 1;
  let cursor = new Date(currentStart);

  for (let i = 0; i < 3; i += 1) {
    const prevStart = addMonths(cursor, -increment);
    if (prevStart >= startDate && cursor <= now) {
      invoices.push({
        id: `INV-${cursor.getFullYear()}${String(cursor.getMonth() + 1).padStart(2, '0')}`,
        period: `${formatDate(prevStart)} - ${formatDate(cursor)}`,
        billedAt: formatDate(cursor),
        status: 'Lunas',
      });
    }
    cursor = prevStart;
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-neutral-light">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 pt-28">
          <section className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.4em] text-secondary">Manage Subscription</p>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold text-text-dark">Kelola Langganan</h1>
                <p className="text-sm text-text-dark/60">
                  Detail tagihan, siklus pembayaran, dan status paket Anda.
                </p>
              </div>
              <Link
                href="/my-profile"
                className="rounded-full border border-primary/30 px-5 py-2 text-xs font-semibold text-primary transition hover:border-secondary hover:text-secondary"
              >
                Kembali ke Portal
              </Link>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-text-dark">Ringkasan Langganan</h2>
                  <p className="text-sm text-text-dark/60">Akun: {user.email}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {user.plan ?? 'FREE'}
                </span>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-neutral-light p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-text-dark/40">Siklus Penagihan</p>
                  <p className="mt-2 text-lg font-semibold text-text-dark">{cycleLabel}</p>
                  <p className="text-xs text-text-dark/60">{cycleDesc}</p>
                </div>
                <div className="rounded-2xl bg-neutral-light p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-text-dark/40">Tagihan Berikutnya</p>
                  <p className="mt-2 text-lg font-semibold text-text-dark">{formatDate(next)}</p>
                  <p className="text-xs text-text-dark/60">Periode berjalan: {periodLabel}</p>
                </div>
                <div className="rounded-2xl bg-neutral-light p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-text-dark/40">Status</p>
                  <p className="mt-2 text-lg font-semibold text-secondary">Aktif</p>
                  <p className="text-xs text-text-dark/60">Pembayaran otomatis sesuai kontrak.</p>
                </div>
                <div className="rounded-2xl bg-neutral-light p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-text-dark/40">Metode Pembayaran</p>
                  <p className="mt-2 text-lg font-semibold text-text-dark">Belum diatur</p>
                  <p className="text-xs text-text-dark/60">Tambahkan metode untuk tagihan otomatis.</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-text-dark">Aksi Cepat</h2>
              <div className="mt-4 space-y-3 text-sm text-text-dark/70">
                <button
                  type="button"
                  className="w-full rounded-2xl border border-primary/20 px-4 py-3 text-left font-semibold text-primary transition hover:border-secondary hover:text-secondary"
                >
                  Upgrade / Downgrade Plan
                </button>
                <button
                  type="button"
                  className="w-full rounded-2xl border border-primary/20 px-4 py-3 text-left font-semibold text-primary transition hover:border-secondary hover:text-secondary"
                >
                  Perbarui Metode Pembayaran
                </button>
                <button
                  type="button"
                  className="w-full rounded-2xl border border-primary/20 px-4 py-3 text-left font-semibold text-primary transition hover:border-secondary hover:text-secondary"
                >
                  Hubungi Tim Billing
                </button>
              </div>
              <p className="mt-4 text-xs text-text-dark/50">
                Untuk perubahan kontrak tahunan/bulanan, silakan hubungi tim billing.
              </p>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-text-dark">Riwayat Tagihan</h2>
                <p className="text-sm text-text-dark/60">
                  Tagihan sebelumnya berdasarkan periode aktif Anda.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full border border-primary/30 px-4 py-2 text-xs font-semibold text-primary transition hover:border-secondary hover:text-secondary"
              >
                Unduh Semua Invoice
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {invoices.length ? (
                invoices.map((invoice) => (
                  <div key={invoice.id} className="rounded-2xl border border-primary/10 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-text-dark/40">{invoice.id}</p>
                    <p className="mt-2 text-sm font-semibold text-text-dark">{invoice.period}</p>
                    <p className="text-xs text-text-dark/60">Tanggal tagih: {invoice.billedAt}</p>
                    <p className="mt-3 inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                      {invoice.status}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-dark/60">Belum ada invoice tersedia.</p>
              )}
            </div>
          </section>
        </div>
      </div>
      <Footer settings={settings.footer} />
    </main>
  );
}
