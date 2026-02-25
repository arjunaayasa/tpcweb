'use client';

import { useEffect, useState, useCallback } from 'react';

interface ModelConfig {
  model: string;
  enabled: boolean;
  dailyLimit: number | null;
}

interface AddonModelsData {
  addons: Record<string, ModelConfig[]>;
  allModels: string[];
}

const addonLabels: Record<string, string> = {
  NONE: 'Tanpa Add-on',
  STARTER: 'AI Starter',
  PRO: 'AI Pro',
  UNLIMITED: 'AI Unlimited',
};

const addonOrder = ['NONE', 'STARTER', 'PRO', 'UNLIMITED'];

const modelLabels: Record<string, string> = {
  'owlie-loc': 'Owlie Lite',
  'owlie-chat': 'Owlie Chat v1.5',
  'owlie-thinking': 'Owlie Thinking v1.5',
  'owlie-max': 'Owlie Max v1.5',
};

const modelDescriptions: Record<string, string> = {
  'owlie-loc': 'Model ringan lokal (Qwen 7B)',
  'owlie-chat': 'DeepSeek Chat — cepat & akurat',
  'owlie-thinking': 'DeepSeek Reasoner — analisis mendalam',
  'owlie-max': 'DeepSeek Reasoner 128k — konteks terpanjang',
};

const addonColors: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  NONE: { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-700', text: 'text-slate-900' },
  STARTER: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-900' },
  PRO: { bg: 'bg-teal-50', border: 'border-teal-200', badge: 'bg-teal-100 text-teal-700', text: 'text-teal-900' },
  UNLIMITED: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800', text: 'text-amber-900' },
};

export default function AiAddonModelsPage() {
  const [data, setData] = useState<AddonModelsData | null>(null);
  const [editState, setEditState] = useState<Record<string, ModelConfig[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/ai-addon-models');
      if (!res.ok) throw new Error('Failed to fetch');
      const json: AddonModelsData = await res.json();
      setData(json);
      // Deep clone for edit state
      const clone: Record<string, ModelConfig[]> = {};
      for (const [addon, models] of Object.entries(json.addons)) {
        clone[addon] = models.map(m => ({ ...m }));
      }
      setEditState(clone);
      setDirty(false);
    } catch {
      setToast({ type: 'error', message: 'Gagal memuat konfigurasi.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const toggleModel = (addon: string, model: string) => {
    setEditState(prev => {
      const updated = { ...prev };
      updated[addon] = updated[addon].map(m =>
        m.model === model ? { ...m, enabled: !m.enabled, dailyLimit: !m.enabled ? null : m.dailyLimit } : m
      );
      return updated;
    });
    setDirty(true);
  };

  const setLimit = (addon: string, model: string, value: string) => {
    const num = value === '' ? null : parseInt(value, 10);
    setEditState(prev => {
      const updated = { ...prev };
      updated[addon] = updated[addon].map(m =>
        m.model === model ? { ...m, dailyLimit: num === null || isNaN(num) ? null : num } : m
      );
      return updated;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Flatten all configs
      const configs: { addon: string; model: string; enabled: boolean; dailyLimit: number | null }[] = [];
      for (const [addon, models] of Object.entries(editState)) {
        for (const m of models) {
          configs.push({ addon, model: m.model, enabled: m.enabled, dailyLimit: m.dailyLimit });
        }
      }

      const res = await fetch('/api/ai-addon-models', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || 'Gagal menyimpan');
      }

      setToast({ type: 'success', message: 'Konfigurasi AI Add-on berhasil disimpan!' });
      setDirty(false);
      await fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan konfigurasi.';
      setToast({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-500">Tidak dapat memuat konfigurasi.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Konfigurasi AI Add-on</h1>
          <p className="text-sm text-gray-500 mt-1">
            Atur model AI yang tersedia dan batas harian untuk tiap tingkat add-on
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm ${
            dirty
              ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menyimpan...
            </span>
          ) : (
            'Simpan Perubahan'
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
            <p className="text-sm font-medium text-teal-800">AI Add-on terpisah dari Plan</p>
            <p className="text-xs text-teal-600 mt-0.5">
              Akses AI tidak lagi ditentukan oleh plan. Pengguna harus membeli AI Add-on (Starter / Pro / Unlimited) untuk mengakses model AI.
              Pengguna baru mendapat trial 7 hari AI Starter gratis.
            </p>
          </div>
        </div>
      </div>

      {/* Model Legend */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Model AI Tersedia</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(data.allModels || []).map((model) => (
            <div key={model} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{modelLabels[model] || model}</p>
                <p className="text-xs text-gray-500">{modelDescriptions[model] || ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Addon Cards */}
      <div className="space-y-4">
        {addonOrder.map((addon) => {
          const models = editState[addon];
          if (!models) return null;
          const colors = addonColors[addon] || addonColors.NONE;
          const enabledCount = models.filter(m => m.enabled).length;

          return (
            <div key={addon} className={`border rounded-xl overflow-hidden ${colors.border} ${colors.bg}`}>
              {/* Addon header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-inherit">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
                    {addonLabels[addon] || addon}
                  </span>
                  <span className="text-xs text-gray-500">
                    {enabledCount} dari {models.length} model aktif
                  </span>
                </div>
                {addon === 'NONE' && (
                  <span className="text-xs text-gray-400 italic">Tanpa akses AI</span>
                )}
              </div>

              {/* Model rows */}
              <div className="divide-y divide-inherit">
                {models.map((m) => (
                  <div
                    key={m.model}
                    className={`flex items-center gap-4 px-6 py-4 transition ${
                      m.enabled ? '' : 'opacity-50'
                    }`}
                  >
                    {/* Toggle */}
                    <button
                      onClick={() => toggleModel(addon, m.model)}
                      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                        m.enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          m.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    {/* Model info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${colors.text}`}>
                        {modelLabels[m.model] || m.model}
                      </p>
                      <p className="text-xs text-gray-500">{modelDescriptions[m.model] || m.model}</p>
                    </div>

                    {/* Daily limit */}
                    {m.enabled && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500 whitespace-nowrap">Limit harian:</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="∞"
                          value={m.dailyLimit ?? ''}
                          onChange={(e) => setLimit(addon, m.model, e.target.value)}
                          className="w-20 px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 bg-white"
                        />
                        {m.dailyLimit === null && (
                          <span className="text-xs text-green-600 font-medium">Unlimited</span>
                        )}
                      </div>
                    )}

                    {!m.enabled && (
                      <span className="text-xs text-gray-400 italic">Nonaktif</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

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
