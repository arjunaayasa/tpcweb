'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_SETTINGS } from '@/lib/site-settings';

type SettingsState = typeof DEFAULT_SETTINGS;
type SettingsResponse = { settings: SettingsState };

const cloneDefaults = () => JSON.parse(JSON.stringify(DEFAULT_SETTINGS)) as SettingsState;
const normalizeArray = <T,>(value: T[] | undefined, fallback: T[]) =>
  Array.isArray(value) ? value : fallback;
const normalizeSettings = (value?: SettingsState) => {
  const base = cloneDefaults();
  if (!value) {
    return base;
  }
  return {
    ...base,
    ...value,
    redirects: {
      ...base.redirects,
      ...value.redirects,
    },
    hero: {
      ...base.hero,
      ...value.hero,
      placeholders: normalizeArray(value.hero?.placeholders, base.hero.placeholders),
    },
    features: {
      ...base.features,
      ...value.features,
      cards: normalizeArray(value.features?.cards, base.features.cards),
    },
    featureDetails: {
      ...base.featureDetails,
      ...value.featureDetails,
      items: normalizeArray(value.featureDetails?.items, base.featureDetails.items),
    },
    faq: {
      ...base.faq,
      ...value.faq,
      items: normalizeArray(value.faq?.items, base.faq.items),
      side: {
        ...base.faq.side,
        ...value.faq?.side,
        bullets: normalizeArray(value.faq?.side?.bullets, base.faq.side.bullets),
      },
    },
    footer: {
      ...base.footer,
      ...value.footer,
      sections: normalizeArray(value.footer?.sections, base.footer.sections),
    },
  };
};

const emptyFeatureDetail = { name: '', headline: '', description: '', imageLabel: '' };
const emptyFaqItem = { question: '', answer: '' };
const emptyFooterSection = { title: '', links: [''] };

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(cloneDefaults());
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = async () => {
    setStatus('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/settings', { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Gagal memuat pengaturan');
      }
      const data = (await res.json()) as SettingsResponse;
      setSettings(normalizeSettings(data.settings));
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setSettings(cloneDefaults());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const handleSave = async () => {
    setStatus('');
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        throw new Error('Gagal menyimpan pengaturan');
      }

      const data = (await res.json()) as SettingsResponse;
      setSettings(normalizeSettings(data.settings ?? settings));
      setStatus('Pengaturan tersimpan.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-text-dark/60">Konten</p>
          <h2 className="text-2xl font-semibold text-text-dark">Pengaturan Website</h2>
          <p className="text-sm text-text-dark/60">
            Kelola seluruh teks dan konten halaman utama tanpa mengedit JSON.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving || isLoading}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <button
            type="button"
            onClick={loadSettings}
            className="rounded-xl border border-primary/20 px-4 py-3 text-sm text-text-dark hover:border-secondary"
            disabled={isLoading}
          >
            {isLoading ? 'Memuat...' : 'Muat Ulang'}
          </button>
          {status ? <span className="text-sm text-text-dark/60">{status}</span> : null}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Redirect Fitur */}
        <div className="rounded-2xl border border-primary/20 bg-white p-6">
          <h3 className="text-lg font-semibold text-text-dark">Redirect Fitur</h3>
          <p className="text-sm text-text-dark/60 mt-1">
            URL redirect untuk tombol dan menu Owlie Chat &amp; Tax Knowledge AI.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-text-dark">
              URL Owlie Chat
              <input
                className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                placeholder="https://chat.taxindo.ai"
                value={settings.redirects?.owlieChat ?? ''}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    redirects: { ...prev.redirects, owlieChat: event.target.value },
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-text-dark">
              URL Tax Knowledge AI
              <input
                className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                placeholder="https://knowledge.taxindo.ai"
                value={settings.redirects?.taxKnowledge ?? ''}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    redirects: { ...prev.redirects, taxKnowledge: event.target.value },
                  }))
                }
              />
            </label>
          </div>
          <div className="mt-4">
            <label className="flex flex-col gap-2 text-sm text-text-dark">
              URL Backend (Auth Server)
              <input
                className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                placeholder="http://localhost:3000"
                value={settings.redirects?.backendUrl ?? ''}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    redirects: { ...prev.redirects, backendUrl: event.target.value },
                  }))
                }
              />
              <span className="text-xs text-text-dark/40">
                URL server autentikasi. Kosongkan untuk menggunakan default (env variable atau localhost:3000).
              </span>
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-white p-6">
          <h3 className="text-lg font-semibold text-text-dark">Bagian Utama</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-text-dark">
              Judul
              <input
                className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                value={settings.hero.title}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, title: event.target.value },
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-text-dark">
              Subjudul
              <input
                className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                value={settings.hero.subtitle}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, subtitle: event.target.value },
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-text-dark">
              Tombol Utama
              <input
                className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                value={settings.hero.ctaPrimary}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, ctaPrimary: event.target.value },
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-text-dark">
              Tombol Sekunder
              <input
                className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                value={settings.hero.ctaSecondary}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, ctaSecondary: event.target.value },
                  }))
                }
              />
            </label>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-sm font-semibold text-text-dark">Contoh Pertanyaan</h4>
              <button
                type="button"
                className="rounded-lg border border-primary/20 px-3 py-2 text-xs text-text-dark hover:border-secondary"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, placeholders: [...prev.hero.placeholders, ''] },
                  }))
                }
              >
                Tambah Contoh
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {settings.hero.placeholders.map((value, index) => (
                <div key={`${index}-${value}`} className="flex items-center gap-3">
                  <input
                    className="flex-1 rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm text-text-dark"
                    value={value}
                    onChange={(event) => {
                      const next = [...settings.hero.placeholders];
                      next[index] = event.target.value;
                      setSettings((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, placeholders: next },
                      }));
                    }}
                  />
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600 hover:border-red-300"
                    onClick={() => {
                      const next = settings.hero.placeholders.filter((_, i) => i !== index);
                      setSettings((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, placeholders: next },
                      }));
                    }}
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-white p-6">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-text-dark">Fitur Unggulan</h3>
            <p className="text-sm text-text-dark/60">Judul, subjudul, dan daftar kartu fitur.</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-text-dark">
              Judul
              <input
                className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                value={settings.features.title}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    features: { ...prev.features, title: event.target.value },
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-text-dark">
              Subjudul
              <input
                className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                value={settings.features.subtitle}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    features: { ...prev.features, subtitle: event.target.value },
                  }))
                }
              />
            </label>
          </div>
          <div className="mt-6 grid gap-4">
            {settings.features.cards.map((card, index) => (
              <div key={`${card.title}-${index}`} className="rounded-2xl border border-primary/20 bg-neutral-light p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-dark">Kartu {index + 1}</p>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm text-text-dark"
                    placeholder="Judul kartu"
                    value={card.title}
                    onChange={(event) => {
                      const next = [...settings.features.cards];
                      next[index] = { ...next[index], title: event.target.value };
                      setSettings((prev) => ({
                        ...prev,
                        features: { ...prev.features, cards: next },
                      }));
                    }}
                  />
                  <input
                    className="rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm text-text-dark"
                    placeholder="Deskripsi singkat"
                    value={card.description}
                    onChange={(event) => {
                      const next = [...settings.features.cards];
                      next[index] = { ...next[index], description: event.target.value };
                      setSettings((prev) => ({
                        ...prev,
                        features: { ...prev.features, cards: next },
                      }));
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-text-dark">Detail Produk</h3>
              <p className="text-sm text-text-dark/60">Konten detail setiap produk.</p>
            </div>
            <button
              type="button"
              className="rounded-lg border border-primary/20 px-3 py-2 text-xs text-text-dark hover:border-secondary"
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  featureDetails: {
                    ...prev.featureDetails,
                    items: [...prev.featureDetails.items, { ...emptyFeatureDetail }],
                  },
                }))
              }
            >
              Tambah Produk
            </button>
          </div>
          <div className="mt-4 grid gap-4">
            {settings.featureDetails.items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="rounded-2xl border border-primary/20 bg-neutral-light p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-dark">Produk {index + 1}</p>
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600 hover:border-red-300"
                    onClick={() => {
                      const next = settings.featureDetails.items.filter((_, i) => i !== index);
                      setSettings((prev) => ({
                        ...prev,
                        featureDetails: { ...prev.featureDetails, items: next },
                      }));
                    }}
                  >
                    Hapus
                  </button>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm text-text-dark"
                    placeholder="Nama produk"
                    value={item.name}
                    onChange={(event) => {
                      const next = [...settings.featureDetails.items];
                      next[index] = { ...next[index], name: event.target.value };
                      setSettings((prev) => ({
                        ...prev,
                        featureDetails: { ...prev.featureDetails, items: next },
                      }));
                    }}
                  />
                  <input
                    className="rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm text-text-dark"
                    placeholder="Label gambar"
                    value={item.imageLabel}
                    onChange={(event) => {
                      const next = [...settings.featureDetails.items];
                      next[index] = { ...next[index], imageLabel: event.target.value };
                      setSettings((prev) => ({
                        ...prev,
                        featureDetails: { ...prev.featureDetails, items: next },
                      }));
                    }}
                  />
                </div>
                <div className="mt-3 grid gap-3">
                  <input
                    className="rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm text-text-dark"
                    placeholder="Headline"
                    value={item.headline}
                    onChange={(event) => {
                      const next = [...settings.featureDetails.items];
                      next[index] = { ...next[index], headline: event.target.value };
                      setSettings((prev) => ({
                        ...prev,
                        featureDetails: { ...prev.featureDetails, items: next },
                      }));
                    }}
                  />
                  <textarea
                    className="min-h-[90px] rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm text-text-dark"
                    placeholder="Deskripsi"
                    value={item.description}
                    onChange={(event) => {
                      const next = [...settings.featureDetails.items];
                      next[index] = { ...next[index], description: event.target.value };
                      setSettings((prev) => ({
                        ...prev,
                        featureDetails: { ...prev.featureDetails, items: next },
                      }));
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-white p-6">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-text-dark">Tanya Jawab</h3>
            <p className="text-sm text-text-dark/60">Pertanyaan umum dan panel samping.</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-text-dark">
              Judul
              <input
                className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                value={settings.faq.title}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    faq: { ...prev.faq, title: event.target.value },
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-text-dark">
              Subjudul
              <input
                className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                value={settings.faq.subtitle}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    faq: { ...prev.faq, subtitle: event.target.value },
                  }))
                }
              />
            </label>
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <h4 className="text-sm font-semibold text-text-dark">Daftar Pertanyaan</h4>
            <button
              type="button"
              className="rounded-lg border border-primary/20 px-3 py-2 text-xs text-text-dark hover:border-secondary"
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  faq: {
                    ...prev.faq,
                    items: [...prev.faq.items, { ...emptyFaqItem }],
                  },
                }))
              }
            >
              Tambah Pertanyaan
            </button>
          </div>
          <div className="mt-4 grid gap-4">
            {settings.faq.items.map((item, index) => (
              <div key={`${item.question}-${index}`} className="rounded-2xl border border-primary/20 bg-neutral-light p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-dark">Pertanyaan {index + 1}</p>
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600 hover:border-red-300"
                    onClick={() => {
                      const next = settings.faq.items.filter((_, i) => i !== index);
                      setSettings((prev) => ({
                        ...prev,
                        faq: { ...prev.faq, items: next },
                      }));
                    }}
                  >
                    Hapus
                  </button>
                </div>
                <div className="mt-3 grid gap-3">
                  <input
                    className="rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm text-text-dark"
                    placeholder="Pertanyaan"
                    value={item.question}
                    onChange={(event) => {
                      const next = [...settings.faq.items];
                      next[index] = { ...next[index], question: event.target.value };
                      setSettings((prev) => ({
                        ...prev,
                        faq: { ...prev.faq, items: next },
                      }));
                    }}
                  />
                  <textarea
                    className="min-h-[90px] rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm text-text-dark"
                    placeholder="Jawaban"
                    value={item.answer}
                    onChange={(event) => {
                      const next = [...settings.faq.items];
                      next[index] = { ...next[index], answer: event.target.value };
                      setSettings((prev) => ({
                        ...prev,
                        faq: { ...prev.faq, items: next },
                      }));
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-text-dark">
              Label Penanda
              <input
                className="rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm text-text-dark"
                value={settings.faq.side.kicker}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    faq: { ...prev.faq, side: { ...prev.faq.side, kicker: event.target.value } },
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-text-dark">
              Judul Samping
              <input
                className="rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm text-text-dark"
                value={settings.faq.side.title}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    faq: { ...prev.faq, side: { ...prev.faq.side, title: event.target.value } },
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-text-dark md:col-span-2">
              Deskripsi Samping
              <textarea
                className="min-h-[90px] rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm text-text-dark"
                value={settings.faq.side.body}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    faq: { ...prev.faq, side: { ...prev.faq.side, body: event.target.value } },
                  }))
                }
              />
            </label>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-text-dark">Bullet Samping</h4>
              <button
                type="button"
                className="rounded-lg border border-primary/20 px-3 py-2 text-xs text-text-dark hover:border-secondary"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    faq: {
                      ...prev.faq,
                      side: {
                        ...prev.faq.side,
                        bullets: [...prev.faq.side.bullets, ''],
                      },
                    },
                  }))
                }
              >
                Tambah Bullet
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {settings.faq.side.bullets.map((value, index) => (
                <div key={`${value}-${index}`} className="flex items-center gap-3">
                  <input
                    className="flex-1 rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm text-text-dark"
                    value={value}
                    onChange={(event) => {
                      const next = [...settings.faq.side.bullets];
                      next[index] = event.target.value;
                      setSettings((prev) => ({
                        ...prev,
                        faq: {
                          ...prev.faq,
                          side: { ...prev.faq.side, bullets: next },
                        },
                      }));
                    }}
                  />
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600 hover:border-red-300"
                    onClick={() => {
                      const next = settings.faq.side.bullets.filter((_, i) => i !== index);
                      setSettings((prev) => ({
                        ...prev,
                        faq: {
                          ...prev.faq,
                          side: { ...prev.faq.side, bullets: next },
                        },
                      }));
                    }}
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-white p-6">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-text-dark">Bagian Bawah</h3>
            <p className="text-sm text-text-dark/60">Tagline, lokasi, dan navigasi bagian bawah.</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-text-dark">
              Tagline
              <input
                className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                value={settings.footer.tagline}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, tagline: event.target.value },
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-text-dark">
              Lokasi
              <input
                className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                value={settings.footer.location}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, location: event.target.value },
                  }))
                }
              />
            </label>
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <h4 className="text-sm font-semibold text-text-dark">Kolom Bagian Bawah</h4>
            <button
              type="button"
              className="rounded-lg border border-primary/20 px-3 py-2 text-xs text-text-dark hover:border-secondary"
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  footer: {
                    ...prev.footer,
                    sections: [...prev.footer.sections, { ...emptyFooterSection }],
                  },
                }))
              }
            >
              Tambah Kolom
            </button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {settings.footer.sections.map((section, index) => (
              <div key={`${section.title}-${index}`} className="rounded-2xl border border-primary/20 bg-neutral-light p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-dark">Kolom {index + 1}</p>
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600 hover:border-red-300"
                    onClick={() => {
                      const next = settings.footer.sections.filter((_, i) => i !== index);
                      setSettings((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, sections: next },
                      }));
                    }}
                  >
                    Hapus
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  <input
                    className="w-full rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm text-text-dark"
                    placeholder="Judul kolom"
                    value={section.title}
                    onChange={(event) => {
                      const next = [...settings.footer.sections];
                      next[index] = { ...next[index], title: event.target.value };
                      setSettings((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, sections: next },
                      }));
                    }}
                  />
                  <div className="space-y-2">
                    {section.links.map((link, linkIndex) => (
                      <div key={`${link}-${linkIndex}`} className="flex items-center gap-3">
                        <input
                          className="flex-1 rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm text-text-dark"
                          placeholder="Tautan"
                          value={link}
                          onChange={(event) => {
                            const next = [...settings.footer.sections];
                            const nextLinks = [...next[index].links];
                            nextLinks[linkIndex] = event.target.value;
                            next[index] = { ...next[index], links: nextLinks };
                            setSettings((prev) => ({
                              ...prev,
                              footer: { ...prev.footer, sections: next },
                            }));
                          }}
                        />
                        <button
                          type="button"
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600 hover:border-red-300"
                          onClick={() => {
                            const next = [...settings.footer.sections];
                            next[index] = {
                              ...next[index],
                              links: next[index].links.filter((_, i) => i !== linkIndex),
                            };
                            setSettings((prev) => ({
                              ...prev,
                              footer: { ...prev.footer, sections: next },
                            }));
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="rounded-lg border border-primary/20 px-3 py-2 text-xs text-text-dark hover:border-secondary"
                    onClick={() => {
                      const next = [...settings.footer.sections];
                      next[index] = { ...next[index], links: [...next[index].links, ''] };
                      setSettings((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, sections: next },
                      }));
                    }}
                  >
                    Tambah Tautan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
