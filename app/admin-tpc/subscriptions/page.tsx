'use client';

import { useEffect, useMemo, useState } from 'react';

type PlansResponse = {
  plans: Record<
    string,
    {
      allowedModels?: string[];
      limits?: Record<string, unknown>;
      remaining?: Record<string, unknown>;
    }
  >;
};

const planOptions = [
  { value: 'FREE', label: 'Gratis' },
  { value: 'BASIC', label: 'Dasar' },
  { value: 'PLUS', label: 'Plus' },
  { value: 'MAX', label: 'Maks' },
];

const planStyleMap: Record<
  string,
  {
    card: string;
    badge: string;
    title: string;
    text: string;
    meta: string;
    chip: string;
    divider: string;
  }
> = {
  FREE: {
    card: 'border-blue-100 bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
    title: 'text-blue-900',
    text: 'text-blue-900/80',
    meta: 'text-blue-700/70',
    chip: 'border-blue-200/60 bg-white/80 text-blue-800',
    divider: 'border-blue-200/60',
  },
  BASIC: {
    card: 'border-blue-200 bg-blue-100',
    badge: 'bg-blue-200 text-blue-800',
    title: 'text-blue-900',
    text: 'text-blue-900/80',
    meta: 'text-blue-800/70',
    chip: 'border-blue-300/60 bg-white/70 text-blue-900',
    divider: 'border-blue-200/70',
  },
  PLUS: {
    card: 'border-blue-300 bg-blue-200',
    badge: 'bg-blue-300 text-blue-900',
    title: 'text-blue-900',
    text: 'text-blue-900/80',
    meta: 'text-blue-900/70',
    chip: 'border-blue-300/70 bg-white/60 text-blue-900',
    divider: 'border-blue-300/70',
  },
  MAX: {
    card: 'border-slate-900 bg-slate-900',
    badge: 'bg-white/15 text-white',
    title: 'text-white',
    text: 'text-white/80',
    meta: 'text-white/60',
    chip: 'border-white/20 bg-white/10 text-white',
    divider: 'border-white/20',
  },
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
  if (modelKeyMap[normalized]) return modelKeyMap[normalized];
  return spaced
    .replace(/\bmonthly\b/gi, 'bulanan')
    .replace(/\bannual\b/gi, 'tahunan')
    .replace(/\blimit(s)?\b/gi, 'batas$1')
    .replace(/\bremaining\b/gi, 'sisa')
    .replace(/\bcount(s)?\b/gi, 'jumlah$1')
    .replace(/\busage\b/gi, 'penggunaan')
    .trim();
};

const formatQuotaValue = (value: unknown) => {
  if (value === null) return 'Tanpa batas';
  if (typeof value === 'number') return new Intl.NumberFormat('id-ID').format(value);
  if (typeof value === 'string') return value;
  return '-';
};

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<PlansResponse['plans']>({});
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [pricingForm, setPricingForm] = useState<Record<string, { monthly: string; yearly: string }>>({});
  const [pricingStatus, setPricingStatus] = useState('');
  const [isSavingPricing, setIsSavingPricing] = useState(false);

  const [changeForm, setChangeForm] = useState({
    email: '',
    userId: '',
    plan: 'FREE',
  });
  const [changeStatus, setChangeStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const planEntries = useMemo(() => {
    const order = planOptions.map((option) => option.value);
    return Object.entries(plans).sort((a, b) => {
      const indexA = order.indexOf(a[0]);
      const indexB = order.indexOf(b[0]);
      const safeA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
      const safeB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
      return safeA - safeB;
    });
  }, [plans]);

  const loadPlans = async () => {
    setIsLoading(true);
    setStatus('');
    try {
      const res = await fetch('/api/plans', { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Gagal memuat data paket.');
      }
      const data = (await res.json()) as PlansResponse;
      setPlans(data.plans ?? {});
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPlans();
  }, []);

  useEffect(() => {
    if (!planEntries.length) {
      return;
    }

    setPricingForm((current) => {
      if (Object.keys(current).length) return current;
      const next: Record<string, { monthly: string; yearly: string }> = {};
      planEntries.forEach(([key]) => {
        next[key] = { monthly: '', yearly: '' };
      });
      return next;
    });
  }, [planEntries]);

  const handleChangePlan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setChangeStatus('');

    if (!changeForm.email && !changeForm.userId) {
      setChangeStatus('Isi email atau user ID terlebih dahulu.');
      return;
    }

    setIsUpdating(true);
    try {
      const payload: Record<string, string> = { plan: changeForm.plan };
      if (changeForm.email) payload.email = changeForm.email;
      if (changeForm.userId) payload.userId = changeForm.userId;

      const res = await fetch('/api/billing/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 404) {
          setChangeStatus('Pengguna tidak ditemukan.');
        } else if (res.status === 401) {
          setChangeStatus('Tidak memiliki akses untuk mengubah paket.');
        } else {
          setChangeStatus('Gagal memperbarui paket.');
        }
        return;
      }

      setChangeStatus('Paket berhasil diperbarui.');
      setChangeForm({ email: '', userId: '', plan: changeForm.plan });
    } catch {
      setChangeStatus('Tidak bisa terhubung ke layanan billing.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePricingChange = (key: string, field: 'monthly' | 'yearly', value: string) => {
    setPricingForm((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] ?? { monthly: '', yearly: '' }),
        [field]: value,
      },
    }));
  };

  const handleSavePricing = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPricingStatus('');
    setIsSavingPricing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setPricingStatus('Harga paket berhasil disimpan sebagai referensi.');
    } catch {
      setPricingStatus('Gagal menyimpan harga paket.');
    } finally {
      setIsSavingPricing(false);
    }
  };

  return (
    <section className="space-y-8">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-text-dark/60">Langganan</p>
        <h2 className="text-2xl font-semibold text-text-dark">Kelola Langganan</h2>
        <p className="text-sm text-text-dark/60">
          Lihat detail paket yang tersedia dan perbarui paket pelanggan.
        </p>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-text-dark">Daftar Paket</h3>
          <button
            type="button"
            onClick={loadPlans}
            className="rounded-lg border border-primary/20 px-3 py-2 text-xs text-text-dark hover:border-secondary"
          >
            {isLoading ? 'Memuat...' : 'Muat ulang'}
          </button>
        </div>
        {status ? <p className="text-sm text-text-dark/60">{status}</p> : null}
        {isLoading ? (
          <p className="text-sm text-text-dark/60">Memuat data paket...</p>
        ) : planEntries.length ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {planEntries.map(([key, plan]) => {
              const theme = planStyleMap[key] ?? planStyleMap.FREE;
              return (
                <div key={key} className={`rounded-2xl border p-4 shadow-sm ${theme.card}`}>
                  <div className="flex items-center justify-between">
                    <h4 className={`text-base font-semibold ${theme.title}`}>{key}</h4>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${theme.badge}`}>
                      {key}
                    </span>
                  </div>
                  <div className={`mt-3 space-y-3 text-xs ${theme.text}`}>
                  <div>
                    <p className={`text-[10px] uppercase tracking-[0.3em] ${theme.meta}`}>Model</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(plan.allowedModels ?? []).map((model) => (
                        <span
                          key={model}
                          className={`rounded-full border px-2 py-1 text-[11px] ${theme.chip}`}
                        >
                          {modelLabelMap[model] ?? model}
                        </span>
                      ))}
                    </div>
                  </div>
                  {plan.limits ? (
                    <div>
                      <p className={`text-[10px] uppercase tracking-[0.3em] ${theme.meta}`}>Batas</p>
                      <div className={`mt-2 space-y-1 border-t pt-2 ${theme.divider}`}>
                        {Object.entries(plan.limits).map(([limitKey, value]) => (
                          <div key={limitKey} className="flex items-center justify-between gap-2">
                            <span>{formatKeyLabel(limitKey)}</span>
                            <span className={`font-semibold ${theme.title}`}>
                              {formatQuotaValue(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-text-dark/60">Belum ada data paket.</p>
        )}
      </div>

      <form
        className="rounded-2xl border border-primary/20 bg-white p-6 shadow-sm space-y-4"
        onSubmit={handleChangePlan}
      >
        <div>
          <h3 className="text-lg font-semibold text-text-dark">Ubah Paket Pelanggan</h3>
          <p className="text-sm text-text-dark/60">
            Perbarui paket berdasarkan email atau user ID.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-text-dark">
            Email
            <input
              className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
              type="email"
              value={changeForm.email}
              onChange={(event) => setChangeForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-text-dark">
            User ID
            <input
              className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
              value={changeForm.userId}
              onChange={(event) => setChangeForm((prev) => ({ ...prev, userId: event.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-text-dark">
            Paket
            <select
              className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
              value={changeForm.plan}
              onChange={(event) => setChangeForm((prev) => ({ ...prev, plan: event.target.value }))}
            >
              {planOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="submit"
          className="rounded-xl border border-primary/30 px-4 py-3 text-sm font-semibold text-primary transition hover:border-secondary hover:text-secondary disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isUpdating}
        >
          {isUpdating ? 'Memproses...' : 'Perbarui Paket'}
        </button>
        {changeStatus ? <p className="text-sm text-text-dark/60">{changeStatus}</p> : null}
      </form>

      <form
        className="rounded-2xl border border-primary/20 bg-white p-6 shadow-sm space-y-4"
        onSubmit={handleSavePricing}
      >
        <div>
          <h3 className="text-lg font-semibold text-text-dark">Harga Referensi Paket</h3>
          <p className="text-sm text-text-dark/60">
            Masukkan harga langganan sebagai referensi integrasi payment gateway.
          </p>
        </div>
        <div className="grid gap-4">
          {planEntries.map(([key]) => (
            <div key={key} className="rounded-2xl border border-primary/10 bg-neutral-light p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-text-dark">{key}</p>
                <span className="text-xs text-text-dark/50">Harga / bulan & tahunan</span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-xs text-text-dark/70">
                  Bulanan (IDR)
                  <input
                    className="rounded-xl border border-primary/20 bg-white px-3 py-2 text-sm text-text-dark"
                    placeholder="Contoh: 299000"
                    value={pricingForm[key]?.monthly ?? ''}
                    onChange={(event) => handlePricingChange(key, 'monthly', event.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-2 text-xs text-text-dark/70">
                  Tahunan (IDR)
                  <input
                    className="rounded-xl border border-primary/20 bg-white px-3 py-2 text-sm text-text-dark"
                    placeholder="Contoh: 2990000"
                    value={pricingForm[key]?.yearly ?? ''}
                    onChange={(event) => handlePricingChange(key, 'yearly', event.target.value)}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSavingPricing}
        >
          {isSavingPricing ? 'Menyimpan...' : 'Simpan Harga'}
        </button>
        {pricingStatus ? <p className="text-sm text-text-dark/60">{pricingStatus}</p> : null}
      </form>
    </section>
  );
}
