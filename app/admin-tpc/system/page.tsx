'use client';

import { useCallback, useEffect, useState } from 'react';

type CheckResult = {
  id: string;
  label: string;
  description: string;
  status: 'AKTIF' | 'GANGGUAN';
  detail?: string;
  checkedAt?: string;
};

const checks = [
  {
    id: 'auth',
    label: 'Auth Center',
    description: 'Layanan autentikasi dan paket.',
    url: '/api/plans',
  },
  {
    id: 'metrics',
    label: 'Admin API',
    description: 'Metrik dan validasi akses admin.',
    url: '/api/admin/metrics',
  },
  {
    id: 'testimonials',
    label: 'Konten Testimonial',
    description: 'Akses data testimonial admin.',
    url: '/api/admin/testimonials',
  },
];

export default function AdminSystemPage() {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const runChecks = useCallback(async () => {
    setIsChecking(true);
    const checkedAt = new Date().toLocaleString('id-ID');

    const nextResults = await Promise.all(
      checks.map(async (check) => {
        try {
          const res = await fetch(check.url, { credentials: 'include' });
          return {
            id: check.id,
            label: check.label,
            description: check.description,
            status: res.ok ? 'AKTIF' : 'GANGGUAN',
            detail: res.ok ? 'Respons berhasil.' : `Status ${res.status}`,
            checkedAt,
          } satisfies CheckResult;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Tidak dapat terhubung';
          return {
            id: check.id,
            label: check.label,
            description: check.description,
            status: 'GANGGUAN',
            detail: message,
            checkedAt,
          } satisfies CheckResult;
        }
      }),
    );

    setResults(nextResults);
    setIsChecking(false);
  }, []);

  useEffect(() => {
    void runChecks();
  }, [runChecks]);

  return (
    <section className="space-y-8">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-text-dark/60">Status</p>
        <h2 className="text-2xl font-semibold text-text-dark">Status Sistem</h2>
        <p className="text-sm text-text-dark/60">
          Pantau kesehatan layanan utama dan API admin.
        </p>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-dark">Pemeriksaan Layanan</h3>
          <button
            type="button"
            onClick={runChecks}
            className="rounded-lg border border-primary/20 px-3 py-2 text-xs text-text-dark hover:border-secondary"
            disabled={isChecking}
          >
            {isChecking ? 'Memeriksa...' : 'Perbarui Status'}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {results.map((result) => (
            <div key={result.id} className="rounded-2xl border border-primary/10 bg-neutral-light p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-text-dark">{result.label}</h4>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    result.status === 'AKTIF'
                      ? 'bg-secondary/15 text-secondary'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {result.status === 'AKTIF' ? 'Aktif' : 'Gangguan'}
                </span>
              </div>
              <p className="mt-2 text-sm text-text-dark/60">{result.description}</p>
              <p className="mt-3 text-xs text-text-dark/50">{result.detail}</p>
              <p className="mt-2 text-xs text-text-dark/40">
                Dicek: {result.checkedAt ?? '-'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
