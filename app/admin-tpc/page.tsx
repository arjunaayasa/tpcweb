import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { AUTH_BASE_URL } from '@/lib/sso';
import { getSiteSettings } from '@/lib/site-settings';

const formatNumber = (value: number) =>
  new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value);

const getWeekLabels = () => {
  const formatter = new Intl.DateTimeFormat('id-ID', { weekday: 'short' });
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return formatter.format(date);
  });
};

export default async function AdminDashboardPage() {
  const metric = await prisma.metric.findUnique({
    where: { key: 'total_visits' },
  });
  const totalVisits = metric?.value ?? 0;
  const totalTestimonials = await prisma.testimonial.count();
  const totalSettings = await prisma.siteSetting.count();
  const lastSettingUpdate = await prisma.siteSetting.findFirst({
    orderBy: { updatedAt: 'desc' },
    select: { updatedAt: true },
  });
  const latestTestimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
  });
  let planCount = 0;
  try {
    const res = await fetch(`${AUTH_BASE_URL}/api/plans`, { cache: 'no-store' });
    if (res.ok) {
      const data = (await res.json()) as { plans?: Record<string, unknown> };
      planCount = data.plans ? Object.keys(data.plans).length : 0;
    }
  } catch {
    planCount = 0;
  }
  const settings = await getSiteSettings(['hero', 'features', 'faq', 'footer']);
  const weekLabels = getWeekLabels();
  const distribution = [0.08, 0.1, 0.12, 0.14, 0.15, 0.18, 0.23];
  const trafficSeries =
    totalVisits > 0
      ? distribution.map((ratio) => Math.max(1, Math.round(totalVisits * ratio)))
      : distribution.map(() => 0);
  const chartMax = Math.max(...trafficSeries, 1);

  return (
    <section className="space-y-8">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-text-dark/60">Ringkasan</p>
        <h2 className="text-2xl font-semibold text-text-dark">Dasbor Admin</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
          <p className="text-sm text-text-dark/60">Total Kunjungan</p>
          <p className="mt-3 text-3xl font-semibold text-text-dark">{formatNumber(totalVisits)}</p>
        </div>
        <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
          <p className="text-sm text-text-dark/60">Testimonial</p>
          <p className="mt-3 text-3xl font-semibold text-text-dark">{formatNumber(totalTestimonials)}</p>
        </div>
        <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
          <p className="text-sm text-text-dark/60">Bagian Konten</p>
          <p className="mt-3 text-3xl font-semibold text-text-dark">{formatNumber(totalSettings)}</p>
        </div>
        <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
          <p className="text-sm text-text-dark/60">Update Terakhir</p>
          <p className="mt-3 text-sm font-semibold text-text-dark">
            {lastSettingUpdate?.updatedAt
              ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(lastSettingUpdate.updatedAt)
              : 'Belum ada'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-primary/10 bg-neutral-light p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-text-dark/50">Paket</p>
          <p className="mt-2 text-2xl font-semibold text-text-dark">{formatNumber(planCount)}</p>
          <p className="text-xs text-text-dark/50">Jumlah paket aktif di Auth Center.</p>
        </div>
        <div className="rounded-2xl border border-primary/10 bg-neutral-light p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-text-dark/50">Kartu Fitur</p>
          <p className="mt-2 text-2xl font-semibold text-text-dark">
            {formatNumber(settings.features.cards.length)}
          </p>
          <p className="text-xs text-text-dark/50">Kartu fitur di halaman utama.</p>
        </div>
        <div className="rounded-2xl border border-primary/10 bg-neutral-light p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-text-dark/50">Pertanyaan FAQ</p>
          <p className="mt-2 text-2xl font-semibold text-text-dark">
            {formatNumber(settings.faq.items.length)}
          </p>
          <p className="text-xs text-text-dark/50">Jumlah pertanyaan yang tampil.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-text-dark/50">Perkiraan Trafik</p>
            <h3 className="text-lg font-semibold text-text-dark">Aktivitas 7 Hari Terakhir</h3>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Perkiraan
          </span>
        </div>
        <div className="mt-6 grid grid-cols-7 gap-3">
          {trafficSeries.map((value, index) => (
            <div key={weekLabels[index]} className="flex flex-col items-center gap-2">
              <div className="flex h-36 w-full items-end">
                <div
                  className="w-full rounded-xl bg-[linear-gradient(180deg,#2f7edb,#123c6b)]"
                  style={{ height: `${Math.round((value / chartMax) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-text-dark/60">{weekLabels[index]}</p>
              <p className="text-xs text-text-dark/50">{formatNumber(value)}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-text-dark/50">
          Grafik ini dihitung dari total kunjungan, sehingga bersifat perkiraan untuk melihat tren.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <div className="rounded-2xl border border-primary/10 bg-white p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-dark">Konten Utama</h3>
            <Link
              href="/admin-tpc/settings"
              className="text-sm text-secondary hover:text-primary"
            >
              Kelola konten
            </Link>
          </div>
          <div className="space-y-4 text-sm text-text-dark/70">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-text-dark/50">Bagian Utama</p>
              <p className="text-base font-semibold text-text-dark">{settings.hero.title}</p>
              <p className="text-sm text-text-dark/60">{settings.hero.subtitle}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-text-dark/50">Fitur</p>
              <p>{settings.features.title}</p>
              <p className="text-xs text-text-dark/50">{settings.features.cards.length} kartu aktif</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-text-dark/50">Tanya Jawab</p>
              <p>{settings.faq.title}</p>
              <p className="text-xs text-text-dark/50">{settings.faq.items.length} pertanyaan aktif</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-text-dark/50">Bagian Bawah</p>
              <p>{settings.footer.tagline}</p>
              <p className="text-xs text-text-dark/50">{settings.footer.sections.length} kolom</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-white p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-dark">Testimonial Terbaru</h3>
            <Link
              href="/admin-tpc/testimonials"
              className="text-sm text-secondary hover:text-primary"
            >
              Kelola testimonial
            </Link>
          </div>
          {latestTestimonials.length ? (
            <div className="space-y-4 text-sm text-text-dark/70">
              {latestTestimonials.map((item) => (
                <div key={item.id} className="rounded-2xl border border-primary/10 bg-neutral-light p-4">
                  <p className="text-sm text-text-dark line-clamp-2">{item.quote}</p>
                  <p className="mt-2 text-xs text-text-dark/60">
                    {item.name} - {item.role} - {item.company}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-dark/60">Belum ada testimonial.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-text-dark">Akses Cepat</h3>
            <p className="text-sm text-text-dark/60">
              Jalur cepat menuju modul admin utama.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin-tpc/users"
              className="rounded-full border border-primary/20 px-4 py-2 text-sm font-semibold text-primary hover:border-secondary hover:text-secondary"
            >
              Kelola Pengguna
            </Link>
            <Link
              href="/admin-tpc/subscriptions"
              className="rounded-full border border-primary/20 px-4 py-2 text-sm font-semibold text-primary hover:border-secondary hover:text-secondary"
            >
              Kelola Langganan
            </Link>
            <Link
              href="/admin-tpc/system"
              className="rounded-full border border-primary/20 px-4 py-2 text-sm font-semibold text-primary hover:border-secondary hover:text-secondary"
            >
              Status Sistem
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
