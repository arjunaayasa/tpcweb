'use client';

import { useEffect, useState, useCallback } from 'react';

interface AddonPrice {
  id: string;
  addon: string;
  interval: string;
  currency: string;
  amount: number;
}

const addonOptions = ['STARTER', 'PRO', 'UNLIMITED'] as const;
const intervalOptions = ['MONTHLY', 'YEARLY'] as const;

const addonLabels: Record<string, string> = {
  STARTER: 'AI Starter',
  PRO: 'AI Pro',
  UNLIMITED: 'AI Unlimited',
};

const intervalLabels: Record<string, string> = {
  MONTHLY: 'Bulanan',
  YEARLY: 'Tahunan',
};

const addonColors: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  STARTER: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-900' },
  PRO: { bg: 'bg-teal-50', border: 'border-teal-200', badge: 'bg-teal-100 text-teal-700', text: 'text-teal-900' },
  UNLIMITED: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800', text: 'text-amber-900' },
};

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export default function AiAddonPricesPage() {
  const [prices, setPrices] = useState<AddonPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state: addonKey -> { MONTHLY: string, YEARLY: string }
  const [formState, setFormState] = useState<Record<string, Record<string, string>>>({});

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/ai-addon-prices', { credentials: 'include' });
      if (!res.ok) throw new Error('Gagal memuat harga');
      const data = await res.json();
      const list: AddonPrice[] = data.prices ?? [];
      setPrices(list);

      // Build form state from existing prices
      const form: Record<string, Record<string, string>> = {};
      for (const addon of addonOptions) {
        form[addon] = {};
        for (const interval of intervalOptions) {
          const existing = list.find(p => p.addon === addon && p.interval === interval);
          form[addon][interval] = existing ? String(existing.amount) : '';
        }
      }
      setFormState(form);
    } catch {
      setToast({ type: 'error', message: 'Gagal memuat data harga AI Add-on.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrices(); }, [fetchPrices]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleChange = (addon: string, interval: string, value: string) => {
    // Only allow digits
    const clean = value.replace(/\D/g, '');
    setFormState(prev => ({
      ...prev,
      [addon]: { ...prev[addon], [interval]: clean },
    }));
  };

  const handleSave = async (addon: string, interval: string) => {
    const amount = parseInt(formState[addon]?.[interval] ?? '', 10);
    if (isNaN(amount) || amount < 0) {
      setToast({ type: 'error', message: 'Masukkan jumlah yang valid.' });
      return;
    }

    const key = `${addon}-${interval}`;
    setSaving(key);

    try {
      const res = await fetch('/api/admin/ai-addon-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ addon, interval, amount, currency: 'IDR' }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || 'Gagal menyimpan');
      }

      setToast({ type: 'success', message: `Harga ${addonLabels[addon]} ${intervalLabels[interval]} berhasil disimpan.` });
      await fetchPrices();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan harga.';
      setToast({ type: 'error', message });
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (addon: string, interval: string) => {
    const existing = prices.find(p => p.addon === addon && p.interval === interval);
    if (!existing) return;

    const key = `${addon}-${interval}`;
    setDeleting(key);

    try {
      const res = await fetch(`/api/admin/ai-addon-prices?addon=${addon}&interval=${interval}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Gagal menghapus');

      setToast({ type: 'success', message: `Harga ${addonLabels[addon]} ${intervalLabels[interval]} berhasil dihapus.` });
      await fetchPrices();
    } catch {
      setToast({ type: 'error', message: 'Gagal menghapus harga.' });
    } finally {
      setDeleting(null);
    }
  };

  const handleSaveAll = async () => {
    setSaving('all');
    let count = 0;

    try {
      for (const addon of addonOptions) {
        for (const interval of intervalOptions) {
          const val = formState[addon]?.[interval];
          if (val && parseInt(val, 10) >= 0) {
            const res = await fetch('/api/admin/ai-addon-prices', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ addon, interval, amount: parseInt(val, 10), currency: 'IDR' }),
            });
            if (res.ok) count++;
          }
        }
      }

      setToast({ type: 'success', message: `${count} harga berhasil disimpan.` });
      await fetchPrices();
    } catch {
      setToast({ type: 'error', message: 'Sebagian harga gagal disimpan.' });
    } finally {
      setSaving(null);
    }
  };

  // Check if any field has changed from DB
  const hasChanges = (() => {
    for (const addon of addonOptions) {
      for (const interval of intervalOptions) {
        const dbVal = prices.find(p => p.addon === addon && p.interval === interval);
        const formVal = formState[addon]?.[interval] ?? '';
        const dbStr = dbVal ? String(dbVal.amount) : '';
        if (formVal !== dbStr) return true;
      }
    }
    return false;
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Harga AI Add-on</h1>
          <p className="text-sm text-gray-500 mt-1">
            Atur harga untuk tiap tingkat AI Add-on (bulanan & tahunan)
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={!hasChanges || saving === 'all'}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm ${
            hasChanges
              ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {saving === 'all' ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menyimpan...
            </span>
          ) : (
            'Simpan Semua'
          )}
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-teal-800">Harga ditampilkan di halaman pricing</p>
            <p className="text-xs text-teal-600 mt-0.5">
              Harga yang diatur di sini akan muncul di halaman pricing sebagai pilihan Add-on AI di setiap plan card.
              Kosongkan harga jika interval tersebut belum tersedia.
            </p>
          </div>
        </div>
      </div>

      {/* Addon Price Cards */}
      <div className="space-y-5">
        {addonOptions.map((addon) => {
          const colors = addonColors[addon];
          return (
            <div key={addon} className={`border rounded-xl overflow-hidden ${colors.border} ${colors.bg}`}>
              {/* Addon header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-inherit">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
                    {addonLabels[addon]}
                  </span>
                </div>
                {/* Current prices summary */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {intervalOptions.map(interval => {
                    const existing = prices.find(p => p.addon === addon && p.interval === interval);
                    return existing ? (
                      <span key={interval} className="flex items-center gap-1">
                        <span className="font-medium text-gray-700">{intervalLabels[interval]}:</span>
                        <span className={colors.text}>{formatRupiah(existing.amount)}</span>
                      </span>
                    ) : null;
                  })}
                  {!prices.some(p => p.addon === addon) && (
                    <span className="italic text-gray-400">Belum ada harga</span>
                  )}
                </div>
              </div>

              {/* Price inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-inherit">
                {intervalOptions.map((interval) => {
                  const key = `${addon}-${interval}`;
                  const existing = prices.find(p => p.addon === addon && p.interval === interval);
                  const formVal = formState[addon]?.[interval] ?? '';
                  const dbVal = existing ? String(existing.amount) : '';
                  const isDirty = formVal !== dbVal;

                  return (
                    <div key={interval} className="px-6 py-5">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700">
                          {intervalLabels[interval]}
                        </label>
                        {existing && (
                          <span className="text-xs text-gray-400">
                            Saat ini: {formatRupiah(existing.amount)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 font-medium">Rp</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={formVal}
                          onChange={(e) => handleChange(addon, interval, e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 bg-white"
                        />

                        {/* Save individual */}
                        <button
                          onClick={() => handleSave(addon, interval)}
                          disabled={!isDirty || saving !== null}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                            isDirty
                              ? 'bg-teal-600 text-white hover:bg-teal-700'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {saving === key ? (
                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                          ) : (
                            'Simpan'
                          )}
                        </button>

                        {/* Delete */}
                        {existing && (
                          <button
                            onClick={() => handleDelete(addon, interval)}
                            disabled={deleting !== null}
                            className="px-2 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50 hover:text-red-600 transition"
                            title="Hapus harga"
                          >
                            {deleting === key ? (
                              <span className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin inline-block" />
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Preview */}
                      {formVal && (
                        <p className="mt-2 text-xs text-gray-500">
                          Preview: <span className="font-medium text-gray-700">{formatRupiah(parseInt(formVal, 10) || 0)}</span>
                          {interval === 'YEARLY' && formVal && parseInt(formVal, 10) > 0 && (
                            <span className="ml-1 text-gray-400">
                              ({formatRupiah(Math.round((parseInt(formVal, 10) || 0) / 12))}/bulan)
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Table */}
      {prices.length > 0 && (
        <div className="mt-8 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Ringkasan Harga Saat Ini</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Add-on</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Interval</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Harga</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Per Bulan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prices
                  .filter(p => p.addon !== 'NONE')
                  .sort((a, b) => {
                    const order = ['STARTER', 'PRO', 'UNLIMITED'];
                    const ai = order.indexOf(a.addon) - order.indexOf(b.addon);
                    if (ai !== 0) return ai;
                    return a.interval === 'MONTHLY' ? -1 : 1;
                  })
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${addonColors[p.addon]?.badge ?? 'bg-gray-100 text-gray-700'}`}>
                          {addonLabels[p.addon] || p.addon}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600">{intervalLabels[p.interval] || p.interval}</td>
                      <td className="px-6 py-3 text-right font-medium text-gray-900">{formatRupiah(p.amount)}</td>
                      <td className="px-6 py-3 text-right text-gray-500">
                        {p.interval === 'YEARLY'
                          ? formatRupiah(Math.round(p.amount / 12))
                          : formatRupiah(p.amount)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
