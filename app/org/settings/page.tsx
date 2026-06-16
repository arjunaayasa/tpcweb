import { fetchOrgInfo } from '@/lib/org-server';

export const dynamic = 'force-dynamic';

const formatDate = (iso: string | null) => {
  if (!iso) return 'Tidak terbatas';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(d);
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 px-5 py-4 last:border-0">
      <span className="text-sm text-text-dark/60">{label}</span>
      <span className="text-sm font-semibold text-text-dark">{value}</span>
    </div>
  );
}

export default async function OrgSettingsPage() {
  const org = await fetchOrgInfo();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-text-dark">Pengaturan</h1>
        <p className="mt-1 text-sm text-text-dark/60">Informasi organisasi Anda.</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Row label="Nama Organisasi" value={org?.name ?? '—'} />
        <Row label="Slug" value={org?.slug ?? '—'} />
        <Row label="Subdomain" value={`${org?.slug ?? 'organisasi'}.taxindo.ai`} />
        <Row label="Batas Kursi" value={String(org?.seatLimit ?? 0)} />
        <Row label="Kursi Terpakai" value={String(org?.seatsUsed ?? 0)} />
        <Row label="Masa Aktif Paket" value={formatDate(org?.planExpiresAt ?? null)} />
      </section>

      <p className="text-xs text-text-dark/40">
        Untuk mengubah nama atau slug organisasi, silakan hubungi dukungan Taxindo Prime Consulting.
      </p>
    </div>
  );
}
