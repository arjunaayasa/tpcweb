'use client';

import { useEffect, useState, useCallback } from 'react';

type Collection = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  allowedPlans: string[];
  _count?: { items: number };
};

const ALL_PLANS = [
  { value: 'FREE', label: 'Gratis' },
  { value: 'FREE_LOGIN', label: 'Free Plan' },
  { value: 'UMKM', label: 'UMKM' },
  { value: 'ENTERPRISE', label: 'Enterprise' },
  { value: 'MNC', label: 'MNC / Group' },
] as const;

const planBadgeStyle: Record<string, string> = {
  FREE: 'bg-slate-100 text-slate-600 border-slate-200',
  FREE_LOGIN: 'bg-blue-50 text-blue-600 border-blue-200',
  UMKM: 'bg-teal-50 text-teal-700 border-teal-200',
  ENTERPRISE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  MNC: 'bg-slate-800 text-white border-slate-700',
};

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<Record<string, string>>({});

  // Track local edits: slug → set of plan values
  const [localEdits, setLocalEdits] = useState<Record<string, Set<string>>>({});

  const loadCollections = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/collections', { credentials: 'include' });
      if (!res.ok) throw new Error('Gagal memuat koleksi.');
      const data = (await res.json()) as Collection[];
      setCollections(data);
      // Init local edits from server data
      const edits: Record<string, Set<string>> = {};
      for (const c of data) {
        edits[c.slug] = new Set(c.allowedPlans);
      }
      setLocalEdits(edits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCollections();
  }, [loadCollections]);

  const togglePlan = (slug: string, plan: string) => {
    setLocalEdits((prev) => {
      const current = new Set(prev[slug] ?? []);
      if (current.has(plan)) {
        current.delete(plan);
      } else {
        current.add(plan);
      }
      return { ...prev, [slug]: current };
    });
    // Clear status for that collection
    setSaveStatus((prev) => ({ ...prev, [slug]: '' }));
  };

  const hasChanges = (slug: string): boolean => {
    const original = collections.find((c) => c.slug === slug);
    if (!original) return false;
    const local = localEdits[slug];
    if (!local) return false;
    const origSet = new Set(original.allowedPlans);
    if (origSet.size !== local.size) return true;
    for (const p of origSet) {
      if (!local.has(p)) return true;
    }
    return false;
  };

  const handleSave = async (slug: string) => {
    const plans = localEdits[slug];
    if (!plans) return;

    setSavingSlug(slug);
    setSaveStatus((prev) => ({ ...prev, [slug]: '' }));

    try {
      const res = await fetch(`/api/collections/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ allowedPlans: Array.from(plans) }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Gagal menyimpan' }));
        setSaveStatus((prev) => ({ ...prev, [slug]: data.error || 'Gagal menyimpan' }));
        return;
      }

      // Update local collection data
      setCollections((prev) =>
        prev.map((c) => (c.slug === slug ? { ...c, allowedPlans: Array.from(plans) } : c))
      );
      setSaveStatus((prev) => ({ ...prev, [slug]: 'Berhasil disimpan!' }));
    } catch {
      setSaveStatus((prev) => ({ ...prev, [slug]: 'Tidak bisa terhubung ke server.' }));
    } finally {
      setSavingSlug(null);
    }
  };

  return (
    <section className="space-y-8">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-text-dark/60">Koleksi Dokumen</p>
        <h2 className="text-2xl font-semibold text-text-dark">Konfigurasi Akses Koleksi</h2>
        <p className="text-sm text-text-dark/60">
          Atur paket mana saja yang bisa mengakses dokumen di masing-masing koleksi untuk fitur RAG.
        </p>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-text-dark">Daftar Koleksi</h3>
          <button
            type="button"
            onClick={loadCollections}
            className="rounded-lg border border-primary/20 px-3 py-2 text-xs text-text-dark hover:border-secondary"
          >
            {isLoading ? 'Memuat...' : 'Muat ulang'}
          </button>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {isLoading ? (
          <p className="text-sm text-text-dark/60">Memuat data koleksi...</p>
        ) : collections.length === 0 ? (
          <p className="text-sm text-text-dark/60">Belum ada koleksi dokumen.</p>
        ) : (
          <div className="space-y-4">
            {collections.map((collection) => {
              const activePlans = localEdits[collection.slug] ?? new Set();
              const changed = hasChanges(collection.slug);
              const isSaving = savingSlug === collection.slug;
              const status = saveStatus[collection.slug];

              return (
                <div
                  key={collection.id}
                  className="rounded-2xl border border-primary/10 bg-neutral-light p-5 space-y-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-base font-semibold text-text-dark">{collection.name}</h4>
                      {collection.description ? (
                        <p className="text-xs text-text-dark/60 mt-1">{collection.description}</p>
                      ) : null}
                      <p className="text-xs text-text-dark/40 mt-1">
                        Slug: <span className="font-mono">{collection.slug}</span>
                        {collection._count ? (
                          <span className="ml-3">{collection._count.items} dokumen</span>
                        ) : null}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {changed ? (
                        <button
                          type="button"
                          onClick={() => handleSave(collection.slug)}
                          disabled={isSaving}
                          className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-secondary disabled:opacity-70"
                        >
                          {isSaving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Plan checkboxes */}
                  <div className="flex flex-wrap gap-3">
                    {ALL_PLANS.map((plan) => {
                      const isChecked = activePlans.has(plan.value);
                      const badgeStyle = planBadgeStyle[plan.value] ?? 'bg-slate-100 text-slate-600 border-slate-200';

                      return (
                        <label
                          key={plan.value}
                          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm cursor-pointer transition-all ${
                            isChecked
                              ? badgeStyle + ' shadow-sm'
                              : 'border-slate-200 bg-white text-text-dark/40'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePlan(collection.slug, plan.value)}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                          />
                          <span className={`font-medium ${isChecked ? '' : 'opacity-60'}`}>{plan.label}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Current allowed plans display */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-text-dark/40">Akses aktif:</span>
                    {activePlans.size === 0 ? (
                      <span className="text-xs text-text-dark/40 italic">Tidak ada paket yang memiliki akses</span>
                    ) : (
                      Array.from(activePlans).map((p) => {
                        const label = ALL_PLANS.find((ap) => ap.value === p)?.label ?? p;
                        const style = planBadgeStyle[p] ?? 'bg-slate-100 text-slate-600 border-slate-200';
                        return (
                          <span
                            key={p}
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${style}`}
                          >
                            {label}
                          </span>
                        );
                      })
                    )}
                  </div>

                  {/* Save status */}
                  {status ? (
                    <p className={`text-xs ${status.includes('Berhasil') ? 'text-green-600' : 'text-red-600'}`}>
                      {status}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-text-dark">Keterangan Paket</h3>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {ALL_PLANS.map((plan) => (
            <div key={plan.value} className="flex items-center gap-2 text-xs text-text-dark/70">
              <span className={`inline-block h-3 w-3 rounded-full border ${planBadgeStyle[plan.value]}`} />
              <span className="font-semibold">{plan.label}</span>
              <span className="text-text-dark/40">
                {plan.value === 'FREE' && '— Tanpa login'}
                {plan.value === 'FREE_LOGIN' && '— Gratis dengan login'}
                {plan.value === 'UMKM' && '— Pajak domestik'}
                {plan.value === 'ENTERPRISE' && '— Pajak domestik'}
                {plan.value === 'MNC' && '— Semua dokumen'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
