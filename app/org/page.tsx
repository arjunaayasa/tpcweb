import Link from 'next/link';
import { fetchOrgInfo, fetchOrgUsage } from '@/lib/org-server';

export const dynamic = 'force-dynamic';

const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n);

const formatDate = (iso: string | null) => {
  if (!iso) return 'Tidak terbatas';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(d);
};

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-text-dark/50">{label}</p>
      <p className="mt-2 text-2xl font-bold text-text-dark">{value}</p>
      {hint ? <p className="mt-1 text-xs text-text-dark/50">{hint}</p> : null}
    </div>
  );
}

export default async function OrgDashboardPage() {
  const [org, usage] = await Promise.all([fetchOrgInfo(), fetchOrgUsage()]);

  const seatsUsed = org?.seatsUsed ?? usage?.seatsUsed ?? 0;
  const seatLimit = org?.seatLimit ?? 0;
  const members = usage?.members ?? [];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">{org?.name ?? 'Dasbor Organisasi'}</h1>
          <p className="mt-1 text-sm text-text-dark/60">
            Subdomain:{' '}
            <span className="font-semibold text-primary">{org?.slug ?? 'organisasi'}.taxindo.ai</span>
          </p>
        </div>
        <Link
          href="/org/members"
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          Kelola Anggota
        </Link>
      </header>

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Kursi Terpakai"
          value={`${fmt(seatsUsed)} / ${fmt(seatLimit)}`}
          hint={`${Math.max(seatLimit - seatsUsed, 0)} kursi tersisa`}
        />
        <StatCard
          label="Pemakaian Pool Harian"
          value={fmt(usage?.pool.daily ?? 0)}
          hint="Total prompt hari ini"
        />
        <StatCard
          label="Pemakaian Pool Bulanan"
          value={fmt(usage?.pool.monthly ?? 0)}
          hint="Total prompt bulan ini"
        />
        <StatCard
          label="Masa Aktif Paket"
          value={formatDate(org?.planExpiresAt ?? null)}
          hint="Tanggal berakhir langganan"
        />
      </section>

      {/* Per-member usage table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-text-dark">Pemakaian per Anggota</h2>
          <span className="text-xs text-text-dark/50">{members.length} anggota</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-text-dark/50">
                <th className="px-5 py-3 font-medium">Anggota</th>
                <th className="px-5 py-3 font-medium">Peran</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Harian</th>
                <th className="px-5 py-3 font-medium text-right">Bulanan</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-text-dark/50">
                    Belum ada anggota. Tambahkan anggota dari menu Anggota.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium text-text-dark">{m.name ?? m.email}</p>
                      <p className="text-xs text-text-dark/50">{m.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium text-text-dark/70">
                        {m.orgRole === 'ADMIN' ? 'Admin' : 'Anggota'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          m.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {m.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {fmt(m.usage.daily)}
                      <span className="text-text-dark/40">
                        {' '}
                        / {m.limits.dailyLimit === null ? '∞' : fmt(m.limits.dailyLimit)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {fmt(m.usage.monthly)}
                      <span className="text-text-dark/40">
                        {' '}
                        / {m.limits.monthlyLimit === null ? '∞' : fmt(m.limits.monthlyLimit)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
