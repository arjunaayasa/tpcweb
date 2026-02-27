'use client';

import { useEffect, useMemo, useState } from 'react';

const planOptions = [
  { value: 'FREE', label: 'Gratis' },
  { value: 'BASIC', label: 'Dasar' },
  { value: 'PLUS', label: 'Plus' },
  { value: 'MAX', label: 'Maks' },
];

type ChangePlanResult = {
  id?: string;
  email?: string;
  plan?: string;
  updatedAt?: string;
};

type UserRecord = {
  id: string;
  email: string;
  name?: string | null;
  role?: 'ADMIN' | 'USER';
  plan?: 'FREE' | 'BASIC' | 'PLUS' | 'MAX';
  createdAt: string;
  updatedAt: string;
};

export default function AdminUsersPage() {
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [createStatus, setCreateStatus] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [planForm, setPlanForm] = useState({
    userId: '',
    plan: 'FREE',
    email: '',
  });
  const [planStatus, setPlanStatus] = useState('');
  const [planResult, setPlanResult] = useState<ChangePlanResult | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [userSearch, setUserSearch] = useState('');

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userError, setUserError] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    q: '',
    plan: '',
    role: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatDate = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date);
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-user-menu]')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    setUserError('');
    setCurrentPage(1);
    try {
      const query = new URLSearchParams();
      if (filters.q) query.set('q', filters.q);
      if (filters.plan) query.set('plan', filters.plan);
      if (filters.role) query.set('role', filters.role);
      const url = query.toString() ? `/api/billing/users?${query.toString()}` : '/api/billing/users';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Gagal memuat daftar pengguna.');
      }
      const data = (await res.json()) as { users?: UserRecord[] };
      setUsers(data.users ?? []);
    } catch (err) {
      setUserError(err instanceof Error ? err.message : 'Tidak bisa memuat daftar pengguna.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleSelectUser = (user: UserRecord) => {
    setUserSearch('');
    setSelectedUser(user);
    setPlanForm((prev) => ({
      ...prev,
      userId: user.id,
      plan: user.plan ?? prev.plan,
      email: user.email,
    }));
    setIsPlanOpen(true);
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Biarkan gagal tanpa memblokir UI
    }
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateStatus('');
    setIsCreating(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(createForm),
      });

      if (res.ok) {
        setCreateStatus('Pengguna baru berhasil dibuat.');
        setCreateForm({ name: '', email: '', password: '' });
        setIsCreateOpen(false);
        await loadUsers();
      } else if (res.status === 409) {
        setCreateStatus('Email sudah terdaftar. Gunakan email lain.');
      } else if (res.status === 400) {
        setCreateStatus('Data tidak valid. Periksa kembali formulir.');
      } else {
        setCreateStatus('Gagal membuat pengguna.');
      }
    } catch {
      setCreateStatus('Layanan autentikasi tidak tersedia.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleChangePlan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPlanStatus('');
    setPlanResult(null);

    if (!planForm.userId) {
      setPlanStatus('Pilih pengguna terlebih dahulu.');
      return;
    }

    setIsUpdating(true);
    try {
      const payload: Record<string, string> = {
        plan: planForm.plan,
        email: planForm.email,
      };

      const res = await fetch(`/api/admin/users/${planForm.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 404) {
          setPlanStatus('Pengguna tidak ditemukan.');
        } else if (res.status === 401) {
          setPlanStatus('Tidak memiliki akses untuk mengubah pengguna.');
        } else {
          setPlanStatus('Gagal memperbarui pengguna.');
        }
        return;
      }

      const data = (await res.json()) as ChangePlanResult;
      setPlanResult(data);
      setPlanStatus('Data pengguna berhasil diperbarui.');
      await loadUsers();
    } catch {
      setPlanStatus('Tidak bisa terhubung ke layanan admin.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenPlan = (user?: UserRecord) => {
    setUserSearch('');
    if (user) {
      setSelectedUser(user);
      setPlanForm((prev) => ({
        ...prev,
        userId: user.id,
        plan: user.plan ?? prev.plan,
        email: user.email,
      }));
    } else {
      setSelectedUser(null);
      setPlanForm((prev) => ({
        ...prev,
        userId: '',
        email: '',
      }));
    }
    setPlanStatus('');
    setPlanResult(null);
    setIsPlanOpen(true);
  };

  const totalPages = Math.max(1, Math.ceil(users.length / itemsPerPage));
  const pagedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return users.slice(start, start + itemsPerPage);
  }, [users, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => {
      const name = user.name?.toLowerCase() ?? '';
      const email = user.email.toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [users, userSearch]);

  return (
    <section className="space-y-8">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-text-dark/60">Manajemen</p>
        <h2 className="text-2xl font-semibold text-text-dark">Kelola Pengguna</h2>
        <p className="text-sm text-text-dark/60">
          Buat pengguna baru dan kelola paket berlangganan tanpa mengetik manual.
        </p>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-text-dark">Daftar Pengguna</h3>
            <p className="text-sm text-text-dark/60">
              Menampilkan seluruh pengguna di Auth Center.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setCreateStatus('');
                setIsCreateOpen(true);
              }}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary"
            >
              + Pengguna Baru
            </button>
            <button
              type="button"
              onClick={() => handleOpenPlan()}
              className="rounded-full border border-primary/20 px-4 py-2 text-sm text-text-dark hover:border-secondary"
            >
              Ubah Paket
            </button>
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="rounded-full border border-primary/20 px-4 py-2 text-sm text-text-dark hover:border-secondary"
            >
              {showFilters ? 'Tutup Filter' : 'Filter'}
            </button>
            <button
              type="button"
              onClick={loadUsers}
              className="rounded-full border border-primary/20 px-4 py-2 text-sm text-text-dark hover:border-secondary"
              disabled={isLoadingUsers}
            >
              {isLoadingUsers ? 'Memuat...' : 'Muat ulang'}
            </button>
          </div>
        </div>

        {showFilters ? (
          <div className="grid gap-3 md:grid-cols-[1.4fr,1fr,1fr,auto]">
            <input
              className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
              placeholder="Cari nama atau email"
              value={filters.q}
              onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
            />
            <select
              className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
              value={filters.plan}
              onChange={(event) => setFilters((prev) => ({ ...prev, plan: event.target.value }))}
            >
              <option value="">Semua paket</option>
              {planOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
              value={filters.role}
              onChange={(event) => setFilters((prev) => ({ ...prev, role: event.target.value }))}
            >
              <option value="">Semua role</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
            <button
              type="button"
              onClick={loadUsers}
              className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isLoadingUsers}
            >
              Terapkan
            </button>
          </div>
        ) : null}

        {userError ? <p className="text-sm text-red-500">{userError}</p> : null}

        {isLoadingUsers ? (
          <p className="text-sm text-text-dark/60">Memuat daftar pengguna...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-text-dark/60">Tidak ada pengguna yang ditemukan.</p>
        ) : (
          <div className="grid gap-3">
            {pagedUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/10 bg-neutral-light p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-text-dark">{user.name || user.email}</p>
                  <p className="text-xs text-text-dark/60">{user.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-dark/50">
                    <span className="rounded-full border border-primary/10 bg-white px-2 py-1">
                      {user.role ?? 'USER'}
                    </span>
                    <span className="rounded-full border border-primary/10 bg-white px-2 py-1">
                      Paket: {user.plan ?? '-'}
                    </span>
                    <span className="rounded-full border border-primary/10 bg-white px-2 py-1">
                      Dibuat: {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="relative" data-user-menu>
                  <button
                    type="button"
                    onClick={() => setOpenMenuId((current) => (current === user.id ? null : user.id))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 text-sm text-text-dark hover:border-secondary"
                    aria-label="Menu aksi"
                  >
                    ...
                  </button>
                  {openMenuId === user.id ? (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-primary/10 bg-white p-2 text-sm shadow-lg">
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectUser(user);
                          setOpenMenuId(null);
                        }}
                        className="w-full rounded-xl px-3 py-2 text-left text-text-dark hover:bg-neutral-light"
                      >
                        Ubah paket
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleCopy(user.email);
                          setOpenMenuId(null);
                        }}
                        className="w-full rounded-xl px-3 py-2 text-left text-text-dark hover:bg-neutral-light"
                      >
                        Salin email
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleCopy(user.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full rounded-xl px-3 py-2 text-left text-text-dark hover:bg-neutral-light"
                      >
                        Salin ID
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {users.length > 0 && totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-xs text-text-dark/60">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1}
              {' - '}
              {Math.min(currentPage * itemsPerPage, users.length)} dari {users.length} pengguna
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="rounded-full border border-primary/20 px-3 py-1 text-xs text-text-dark hover:border-secondary disabled:opacity-50"
                disabled={currentPage === 1}
              >
                Sebelumnya
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-full text-xs ${
                    page === currentPage
                      ? 'bg-primary text-white'
                      : 'border border-primary/20 text-text-dark hover:border-secondary'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="rounded-full border border-primary/20 px-3 py-1 text-xs text-text-dark hover:border-secondary disabled:opacity-50"
                disabled={currentPage === totalPages}
              >
                Berikutnya
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-dark">Tambah Pengguna</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-sm text-text-dark/60 hover:text-text-dark"
              >
                Tutup
              </button>
            </div>
            <form className="mt-4 space-y-4" onSubmit={handleCreate}>
              <label className="flex flex-col gap-2 text-sm text-text-dark">
                Nama
                <input
                  className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                  value={createForm.name}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-text-dark">
                Email
                <input
                  className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-text-dark">
                Password
                <input
                  className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isCreating}
                >
                  {isCreating ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-primary/20 px-4 py-3 text-sm text-text-dark hover:border-secondary"
                >
                  Batal
                </button>
              </div>
              {createStatus ? <p className="text-sm text-text-dark/60">{createStatus}</p> : null}
            </form>
          </div>
        </div>
      ) : null}

      {isPlanOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-dark">Ubah Paket Pengguna</h3>
              <button
                type="button"
                onClick={() => setIsPlanOpen(false)}
                className="text-sm text-text-dark/60 hover:text-text-dark"
              >
                Tutup
              </button>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr,1fr]">
              <div className="rounded-2xl border border-primary/10 bg-neutral-light p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-text-dark/50">Pilih Pengguna</p>
                <input
                  className="mt-3 w-full rounded-xl border border-primary/20 bg-white px-3 py-2 text-sm text-text-dark"
                  placeholder="Cari nama atau email"
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                />
                <div className="mt-3 max-h-56 overflow-y-auto space-y-2">
                  {filteredUsers.length === 0 ? (
                    <p className="text-xs text-text-dark/60">Tidak ada pengguna.</p>
                  ) : (
                    filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelectedUser(user);
                          setPlanForm((prev) => ({
                            ...prev,
                            userId: user.id,
                            plan: user.plan ?? prev.plan,
                            email: user.email,
                          }));
                        }}
                        className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                          selectedUser?.id === user.id
                            ? 'border-primary bg-white'
                            : 'border-transparent bg-white/60 hover:border-primary/20'
                        }`}
                      >
                        <p className="font-semibold text-text-dark">{user.name || user.email}</p>
                        <p className="text-xs text-text-dark/60">{user.email}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleChangePlan}>
                <div className="rounded-2xl border border-primary/10 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-text-dark/50">Pengguna Terpilih</p>
                  {selectedUser ? (
                    <div className="mt-2 text-sm text-text-dark">
                      <p className="font-semibold">{selectedUser.name || selectedUser.email}</p>
                      <p className="text-xs text-text-dark/60">{selectedUser.email}</p>
                      <p className="text-xs text-text-dark/50">ID: {selectedUser.id}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-text-dark/60">Belum ada pengguna dipilih.</p>
                  )}
                </div>
                <label className="flex flex-col gap-2 text-sm text-text-dark">
                  Email
                  <input
                    className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                    type="email"
                    value={planForm.email}
                    onChange={(event) => setPlanForm((prev) => ({ ...prev, email: event.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-text-dark">
                  Paket
                  <select
                    className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                    value={planForm.plan}
                    onChange={(event) => setPlanForm((prev) => ({ ...prev, plan: event.target.value }))}
                  >
                    {planOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="rounded-xl border border-primary/30 px-4 py-3 text-sm font-semibold text-primary transition hover:border-secondary hover:text-secondary disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Memproses...' : 'Simpan Perubahan'}
                </button>
                {planStatus ? <p className="text-sm text-text-dark/60">{planStatus}</p> : null}
                {planResult ? (
                  <div className="rounded-xl border border-primary/10 bg-neutral-light px-4 py-3 text-xs text-text-dark/60">
                    <p>ID: {planResult.id}</p>
                    <p>Email: {planResult.email}</p>
                    <p>Paket: {planResult.plan}</p>
                  </div>
                ) : null}
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
