import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import AvatarEditor from '@/components/avatar-editor';
import { fetchAuthState } from '@/lib/sso';
import { getSiteSettings } from '@/lib/site-settings';

const formatUsage = (value: number) =>
  new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value);

export default async function MyProfilePage() {
  const headerList = await headers();
  const authState = await fetchAuthState(headerList.get('cookie'));

  if (!authState?.user) {
    redirect('/login');
  }

  const settings = await getSiteSettings(['footer']);
  const { user, plan, usage } = authState;
  const models = plan?.allowedModels ?? [];
  const usageEntries = Object.entries(usage?.counts ?? {});
  const limitsEntries = Object.entries(plan?.limits ?? {});
  const remainingEntries = Object.entries(plan?.remaining ?? {});
  const formatQuotaValue = (value: unknown) => {
    if (value === null) return 'Tanpa batas';
    if (typeof value === 'number') return formatUsage(value);
    if (typeof value === 'string') return value;
    return '-';
  };
  const modelLabelMap: Record<string, string> = {
    'owlie-loc': 'Owlie Lite',
    'owlie-chat': 'Owlie Chat v1.5',
    'owlie-thinking': 'Owlie Thinking v1.5',
    'owlie-max': 'Owlie Max v1.5',
  };
  const modelKeyMap: Record<string, string> = {
    'owlie loc': modelLabelMap['owlie-loc'],
    'owlie chat': modelLabelMap['owlie-chat'],
    'owlie thinking': modelLabelMap['owlie-thinking'],
    'owlie max': modelLabelMap['owlie-max'],
  };
  const formatKeyLabel = (rawKey: string) => {
    const spaced = rawKey.replace(/[-_]/g, ' ').trim();
    const normalized = spaced.toLowerCase();
    if (modelKeyMap[normalized]) {
      return modelKeyMap[normalized];
    }
    return spaced
      .replace(/\bremaining\b/gi, 'sisa')
      .replace(/\blimit(s)?\b/gi, 'batas$1')
      .replace(/\bmonthly\b/gi, 'bulanan')
      .replace(/\bannual\b/gi, 'tahunan')
      .replace(/\bcount(s)?\b/gi, 'jumlah$1')
      .replace(/\busage\b/gi, 'penggunaan')
      .replace(/\bmodel\b/gi, 'model')
      .trim();
  };
  const planBadgeClasses = (() => {
    switch (user.plan) {
      case 'MAX':
        return 'bg-black/40 text-white';
      case 'PLUS':
        return 'bg-black/30 text-white';
      case 'BASIC':
        return 'bg-black/20 text-white';
      default:
        return 'bg-white/20 text-white';
    }
  })();
  const planLabelMap: Record<string, string> = {
    FREE: 'Gratis',
    BASIC: 'Dasar',
    PLUS: 'Plus',
    MAX: 'Maks',
  };
  const planLabel = planLabelMap[user.plan ?? ''] ?? (user.plan ?? 'Gratis');
  const formatModelLabel = (model: string) => modelLabelMap[model] ?? model;

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-[linear-gradient(180deg,#F8FAFC_0%,#EEF7FF_45%,#F8FAFC_100%)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 pt-28">
          <section className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
            <div className="relative rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent-warm p-8 text-white shadow-2xl">
              <div className={`absolute right-6 top-6 rounded-full px-4 py-2 text-xs font-semibold ${planBadgeClasses}`}>
                {planLabel}
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">Portal Pengguna</p>
                <h1 className="text-3xl font-semibold">Halo, {user.name ?? user.email}</h1>
                <p className="text-sm text-white/80">
                  Ringkasan lengkap akun, paket, dan penggunaan layanan TPC AI Anda.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/my-profile/subscriptions"
                    className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-primary shadow-lg transition hover:bg-white/90"
                  >
                    Kelola Langganan
                  </Link>
                  <Link
                    href="/"
                    className="rounded-full border border-white/60 px-5 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                  >
                    Jelajahi Produk
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/60 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_55%),linear-gradient(140deg,#ffffff,#f1f5ff)] p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-text-dark">Akun Anda</h2>
              <div className="mt-6 space-y-3 text-sm text-text-dark/70">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-text-dark/40">Email</p>
                  <p className="text-base font-semibold text-text-dark">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-text-dark/40">Nama</p>
                  <p className="text-base font-semibold text-text-dark">{user.name ?? 'Belum diatur'}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/60 bg-[linear-gradient(135deg,#ffffff_0%,#eaf5ff_55%,#e8fff7_100%)] p-6 shadow-xl lg:col-span-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-text-dark">Paket & Akses</h2>
                  <p className="text-sm text-text-dark/60">
                    Akses layanan dan model yang tersedia untuk paket Anda saat ini.
                  </p>
                </div>
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                  {planLabel}
                </span>
              </div>
              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.3em] text-text-dark/40">Model Tersedia</p>
                {models.length ? (
                  <ul className="mt-3 grid gap-2 text-sm text-text-dark/70 md:grid-cols-2">
                    {models.map((model) => (
                      <li
                        key={model}
                        className="rounded-2xl border border-white/70 bg-white/70 px-3 py-2 shadow-sm"
                      >
                        {formatModelLabel(model)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-text-dark/60">Belum ada model yang terdaftar.</p>
                )}
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-text-dark/40">Batas</p>
                  {limitsEntries.length ? (
                    <div className="mt-4 space-y-2 text-sm text-text-dark/70">
                      {limitsEntries.map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="capitalize">{formatKeyLabel(key)}</span>
                          <span className="font-semibold text-text-dark">{formatQuotaValue(value)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-text-dark/60">Tidak ada batasan tercatat.</p>
                  )}
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-text-dark/40">Sisa Kuota</p>
                  {remainingEntries.length ? (
                    <div className="mt-4 space-y-2 text-sm text-text-dark/70">
                      {remainingEntries.map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="capitalize">{formatKeyLabel(key)}</span>
                          <span className="font-semibold text-text-dark">{formatQuotaValue(value)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-text-dark/60">Tidak ada sisa kuota tercatat.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-[linear-gradient(160deg,#0f172a,#1f2937)] p-6 shadow-xl text-white">
              <h2 className="text-lg font-semibold">Ringkasan Penggunaan</h2>
              <p className="text-sm text-white/60">
                Periode: {usage?.period ?? '-'}
              </p>
              <div className="mt-6 space-y-3 text-sm text-white/70">
                {usageEntries.length ? (
                  usageEntries.slice(0, 6).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <span className="capitalize text-white/70">{formatKeyLabel(key)}</span>
                      <span className="font-semibold text-white">{formatUsage(value)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/60">Belum ada penggunaan tercatat.</p>
                )}
              </div>
            </div>
          </section>

          <section>
            <div className="rounded-3xl border border-white/60 bg-[linear-gradient(135deg,#ecfeff_0%,#f0f9ff_55%,#e0f2fe_100%)] p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-text-dark">Status Layanan</h2>
              <div className="mt-4 space-y-3 text-sm text-text-dark/70">
                <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-sm">
                  <span>Owlie Chat</span>
                  <span className="text-xs font-semibold text-secondary">Aktif</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-sm">
                  <span>Tax Knowledge AI</span>
                  <span className="text-xs font-semibold text-secondary">Aktif</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-sm">
                  <span>Studio AI</span>
                  <span className="text-xs font-semibold text-secondary">Aktif</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-text-dark/50">
                Akses layanan mengikuti paket dan kuota yang tersedia.
              </p>
            </div>
          </section>
        </div>
      </div>
      <Footer settings={settings.footer} />
    </main>
  );
}
