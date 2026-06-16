'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { OrgMember } from '@/lib/org-types';

const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n);

type Props = {
  initialMembers: OrgMember[];
  seatLimit: number;
  seatsUsed: number;
};

type Banner = { kind: 'error' | 'success' | 'seat'; text: string } | null;

export default function MembersClient({ initialMembers, seatLimit, seatsUsed }: Props) {
  const router = useRouter();
  const [members, setMembers] = useState<OrgMember[]>(initialMembers);
  const [banner, setBanner] = useState<Banner>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Create-member modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);

  // Limits modal
  const [limitTarget, setLimitTarget] = useState<OrgMember | null>(null);
  const [dailyLimit, setDailyLimit] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [savingLimit, setSavingLimit] = useState(false);

  const refresh = useCallback(() => router.refresh(), [router]);

  const handleCreate = useCallback(async () => {
    if (!newEmail.trim() || !newPassword.trim()) {
      setBanner({ kind: 'error', text: 'Email dan kata sandi wajib diisi.' });
      return;
    }
    setCreating(true);
    setBanner(null);
    try {
      const res = await fetch('/api/org/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: newEmail.trim(),
          password: newPassword,
          name: newName.trim() || undefined,
        }),
      });

      if (res.status === 409) {
        const data = (await res.json().catch(() => ({}))) as { code?: string };
        if (data.code === 'SEAT_LIMIT_REACHED') {
          setBanner({
            kind: 'seat',
            text: 'Batas kursi tercapai. Tambah kursi terlebih dahulu untuk menambah anggota baru.',
          });
        } else {
          setBanner({ kind: 'error', text: 'Email sudah terdaftar pada organisasi.' });
        }
        setCreating(false);
        return;
      }

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setBanner({ kind: 'error', text: data.error ?? 'Gagal menambah anggota.' });
        setCreating(false);
        return;
      }

      setCreateOpen(false);
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      setBanner({ kind: 'success', text: 'Anggota berhasil ditambahkan.' });
      refresh();
    } catch {
      setBanner({ kind: 'error', text: 'Terjadi kesalahan. Silakan coba lagi.' });
    } finally {
      setCreating(false);
    }
  }, [newEmail, newName, newPassword, refresh]);

  const handleToggleActive = useCallback(
    async (m: OrgMember) => {
      setBusyId(m.id);
      setBanner(null);
      try {
        const res = await fetch(`/api/org/members/${m.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ isActive: !m.isActive }),
        });
        if (!res.ok) {
          setBanner({ kind: 'error', text: 'Gagal memperbarui status anggota.' });
          return;
        }
        setMembers((prev) =>
          prev.map((x) => (x.id === m.id ? { ...x, isActive: !m.isActive } : x)),
        );
      } catch {
        setBanner({ kind: 'error', text: 'Terjadi kesalahan. Silakan coba lagi.' });
      } finally {
        setBusyId(null);
      }
    },
    [],
  );

  const handleDelete = useCallback(
    async (m: OrgMember) => {
      if (!window.confirm(`Hapus anggota ${m.email}? Tindakan ini tidak dapat dibatalkan.`)) {
        return;
      }
      setBusyId(m.id);
      setBanner(null);
      try {
        const res = await fetch(`/api/org/members/${m.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!res.ok) {
          setBanner({ kind: 'error', text: 'Gagal menghapus anggota.' });
          return;
        }
        setMembers((prev) => prev.filter((x) => x.id !== m.id));
        setBanner({ kind: 'success', text: 'Anggota dihapus.' });
        refresh();
      } catch {
        setBanner({ kind: 'error', text: 'Terjadi kesalahan. Silakan coba lagi.' });
      } finally {
        setBusyId(null);
      }
    },
    [refresh],
  );

  const openLimits = useCallback((m: OrgMember) => {
    setLimitTarget(m);
    setDailyLimit(m.limits.dailyLimit === null ? '' : String(m.limits.dailyLimit));
    setMonthlyLimit(m.limits.monthlyLimit === null ? '' : String(m.limits.monthlyLimit));
  }, []);

  const handleSaveLimits = useCallback(async () => {
    if (!limitTarget) return;
    const parse = (v: string): number | null => {
      const t = v.trim();
      if (t === '') return null;
      const n = Number(t);
      return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
    };
    const daily = parse(dailyLimit);
    const monthly = parse(monthlyLimit);

    setSavingLimit(true);
    setBanner(null);
    try {
      const res = await fetch(`/api/org/members/${limitTarget.id}/limits`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ dailyLimit: daily, monthlyLimit: monthly }),
      });
      if (!res.ok) {
        setBanner({ kind: 'error', text: 'Gagal menyimpan batas pemakaian.' });
        setSavingLimit(false);
        return;
      }
      setMembers((prev) =>
        prev.map((x) =>
          x.id === limitTarget.id
            ? { ...x, limits: { dailyLimit: daily, monthlyLimit: monthly } }
            : x,
        ),
      );
      setLimitTarget(null);
      setBanner({ kind: 'success', text: 'Batas pemakaian diperbarui.' });
    } catch {
      setBanner({ kind: 'error', text: 'Terjadi kesalahan. Silakan coba lagi.' });
    } finally {
      setSavingLimit(false);
    }
  }, [limitTarget, dailyLimit, monthlyLimit]);

  const seatsFull = seatsUsed >= seatLimit && seatLimit > 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Anggota</h1>
          <p className="mt-1 text-sm text-text-dark/60">
            {fmt(seatsUsed)} dari {fmt(seatLimit)} kursi terpakai.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (seatsFull) {
              setBanner({
                kind: 'seat',
                text: 'Batas kursi tercapai. Tambah kursi terlebih dahulu.',
              });
              return;
            }
            setCreateOpen(true);
          }}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          + Tambah Anggota
        </button>
      </header>

      {banner ? (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            banner.kind === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : banner.kind === 'seat'
                ? 'border border-amber-200 bg-amber-50 text-amber-700'
                : 'border border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {banner.text}
          {banner.kind === 'seat' ? (
            <>
              {' '}
              <Link href="/org/seats" className="font-semibold underline">
                Buka halaman Kursi
              </Link>
              .
            </>
          ) : null}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-text-dark/50">
                <th className="px-5 py-3 font-medium">Anggota</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Harian (pakai/batas)</th>
                <th className="px-5 py-3 font-medium text-right">Bulanan (pakai/batas)</th>
                <th className="px-5 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-text-dark/50">
                    Belum ada anggota.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="border-b border-slate-50 last:border-0 align-top">
                    <td className="px-5 py-3">
                      <p className="font-medium text-text-dark">{m.name ?? m.email}</p>
                      <p className="text-xs text-text-dark/50">{m.email}</p>
                      {m.orgRole === 'ADMIN' ? (
                        <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          Admin
                        </span>
                      ) : null}
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
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openLimits(m)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-text-dark/70 hover:bg-slate-50"
                        >
                          Batas
                        </button>
                        <button
                          type="button"
                          disabled={busyId === m.id || m.orgRole === 'ADMIN'}
                          onClick={() => void handleToggleActive(m)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-text-dark/70 hover:bg-slate-50 disabled:opacity-40"
                        >
                          {m.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button
                          type="button"
                          disabled={busyId === m.id || m.orgRole === 'ADMIN'}
                          onClick={() => void handleDelete(m)}
                          className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create member modal */}
      {createOpen ? (
        <Modal title="Tambah Anggota" onClose={() => setCreateOpen(false)}>
          <div className="space-y-4">
            <Field label="Email">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="anggota@perusahaan.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Nama (opsional)">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nama Lengkap"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Kata Sandi">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none"
              />
            </Field>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-text-dark/70 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={creating}
              onClick={() => void handleCreate()}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {creating ? 'Menyimpan...' : 'Tambah'}
            </button>
          </div>
        </Modal>
      ) : null}

      {/* Limits modal */}
      {limitTarget ? (
        <Modal
          title={`Batas Pemakaian — ${limitTarget.name ?? limitTarget.email}`}
          onClose={() => setLimitTarget(null)}
        >
          <p className="mb-4 text-xs text-text-dark/60">
            Kosongkan untuk tanpa batas (hanya dibatasi pool organisasi).
          </p>
          <div className="space-y-4">
            <Field label="Batas Harian">
              <input
                type="number"
                min={0}
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                placeholder="Tanpa batas"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Batas Bulanan">
              <input
                type="number"
                min={0}
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                placeholder="Tanpa batas"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none"
              />
            </Field>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setLimitTarget(null)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-text-dark/70 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={savingLimit}
              onClick={() => void handleSaveLimits()}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {savingLimit ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-text-dark">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</label>
      {children}
    </div>
  );
}
