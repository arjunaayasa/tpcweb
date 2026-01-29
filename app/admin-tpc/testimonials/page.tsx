'use client';

import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_TESTIMONIALS, DEFAULT_TESTIMONIAL_PHOTO_URL } from '@/lib/testimonials';

type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  photoUrl: string;
};

const emptyForm = {
  quote: '',
  name: '',
  role: '',
  company: '',
  photoUrl: '',
};

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState('');

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  const loadTestimonials = async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/testimonials', { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Gagal memuat testimonial');
      }
      const data = (await res.json()) as { testimonials: Testimonial[] };
      setTestimonials(data.testimonials ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTestimonials();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error('Gagal menyimpan testimonial');
      }

      const data = (await res.json()) as { testimonial: Testimonial };
      setTestimonials((current) => [data.testimonial, ...current]);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError('');
    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Gagal menghapus testimonial');
      }

      setTestimonials((current) => current.filter((item) => item.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setDraft(emptyForm);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleSeedDefaults = async () => {
    setIsSeeding(true);
    setError('');

    try {
      const results = await Promise.all(
        DEFAULT_TESTIMONIALS.map((item) =>
          fetch('/api/admin/testimonials', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              quote: item.quote,
              name: item.name,
              role: item.role,
              company: item.company,
              photoUrl: item.photoUrl,
            }),
          }),
        ),
      );

      const hasFailed = results.some((res) => !res.ok);
      if (hasFailed) {
        throw new Error('Gagal menyimpan data contoh.');
      }

      await loadTestimonials();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleStartEdit = (item: Testimonial) => {
    setEditingId(item.id);
    setDraft({
      quote: item.quote,
      name: item.name,
      role: item.role,
      company: item.company,
      photoUrl: item.photoUrl,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: editingId, ...draft }),
      });

      if (!res.ok) {
        throw new Error('Gagal memperbarui testimonial');
      }

      const data = (await res.json()) as { testimonial: Testimonial };
      setTestimonials((current) =>
        current.map((item) => (item.id === data.testimonial.id ? data.testimonial : item)),
      );
      setEditingId(null);
      setDraft(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-8">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-text-dark/60">Konten</p>
        <h2 className="text-2xl font-semibold text-text-dark">Testimonial</h2>
      </div>

      <form className="grid gap-4 rounded-2xl border border-primary/20 bg-white p-6" onSubmit={handleCreate}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            Nama
            <input
              className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Jabatan
            <input
              className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Perusahaan
            <input
              className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
              value={form.company}
              onChange={(event) => setForm({ ...form, company: event.target.value })}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            URL Foto
            <input
              className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
              value={form.photoUrl}
              onChange={(event) => setForm({ ...form, photoUrl: event.target.value })}
              placeholder={DEFAULT_TESTIMONIAL_PHOTO_URL}
            />
          </label>
        </div>
        <label className="flex flex-col gap-2 text-sm">
          Kutipan
          <textarea
            className="min-h-[120px] rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
            value={form.quote}
            onChange={(event) => setForm({ ...form, quote: event.target.value })}
            required
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Tambah Testimonial'}
          </button>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </div>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-dark">Daftar Testimonial</h3>
          <button
            className="text-sm text-text-dark/60 underline-offset-4 hover:text-secondary hover:underline"
            type="button"
            onClick={loadTestimonials}
            disabled={isLoading}
          >
            {isLoading ? 'Memuat...' : 'Muat ulang'}
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-text-dark/60">Memuat testimonial...</p>
        ) : testimonials.length === 0 ? (
          <div className="rounded-2xl border border-primary/10 bg-neutral-light p-5 space-y-3">
            <p className="text-sm text-text-dark/60">Belum ada testimonial tersimpan.</p>
            <p className="text-xs text-text-dark/50">
              Halaman depan memakai data contoh jika database kosong. Kamu bisa isi manual atau impor data contoh.
            </p>
            <button
              type="button"
              onClick={handleSeedDefaults}
              className="rounded-full border border-primary/20 px-4 py-2 text-xs font-semibold text-primary hover:border-secondary hover:text-secondary disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSeeding}
            >
              {isSeeding ? 'Mengisi data...' : 'Gunakan data contoh'}
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {testimonials.map((item) => (
              <div key={item.id} className="rounded-2xl border border-primary/20 bg-neutral-light p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-text-dark/60">{item.quote}</p>
                    <p className="text-xs text-text-dark/60">
                      {item.name} - {item.role} - {item.company}
                    </p>
                    <p className="text-xs text-text-dark/50">{item.photoUrl}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="rounded-lg border border-primary/20 px-3 py-1 text-xs text-text-dark hover:border-secondary"
                      type="button"
                      onClick={() => handleStartEdit(item)}
                    >
                      Ubah
                    </button>
                    <button
                      className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:border-red-300"
                      type="button"
                      onClick={() => handleDelete(item.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                {editingId === item.id ? (
                  <div className="mt-4 grid gap-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        className="rounded-xl border border-primary/20 bg-white px-4 py-2 text-xs text-text-dark"
                        value={draft.name}
                        onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                        placeholder="Nama"
                      />
                      <input
                        className="rounded-xl border border-primary/20 bg-white px-4 py-2 text-xs text-text-dark"
                        value={draft.role}
                        onChange={(event) => setDraft({ ...draft, role: event.target.value })}
                        placeholder="Jabatan"
                      />
                      <input
                        className="rounded-xl border border-primary/20 bg-white px-4 py-2 text-xs text-text-dark"
                        value={draft.company}
                        onChange={(event) => setDraft({ ...draft, company: event.target.value })}
                        placeholder="Perusahaan"
                      />
                      <input
                        className="rounded-xl border border-primary/20 bg-white px-4 py-2 text-xs text-text-dark"
                        value={draft.photoUrl}
                        onChange={(event) => setDraft({ ...draft, photoUrl: event.target.value })}
                        placeholder={DEFAULT_TESTIMONIAL_PHOTO_URL}
                      />
                    </div>
                    <textarea
                      className="min-h-[90px] rounded-xl border border-primary/20 bg-white px-4 py-2 text-xs text-text-dark"
                      value={draft.quote}
                      onChange={(event) => setDraft({ ...draft, quote: event.target.value })}
                      placeholder="Kutipan"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        type="button"
                        onClick={handleSaveEdit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                      <button
                        className="rounded-lg border border-primary/20 px-3 py-2 text-xs text-text-dark hover:border-secondary"
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setDraft(emptyForm);
                        }}
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && !isSubmitting ? <p className="text-sm text-red-400">{error}</p> : null}
      {!isEditing && !error && testimonials.length > 0 ? (
        <p className="text-xs text-text-dark/50">
          Foto akan memakai default jika tidak diisi.
        </p>
      ) : null}
    </section>
  );
}
