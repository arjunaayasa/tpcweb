'use client';

import { useEffect, useState } from 'react';

type MidtransSettings = {
    serverKey: string;
    clientKey: string;
    isProduction: boolean;
};

const defaults: MidtransSettings = {
    serverKey: '',
    clientKey: '',
    isProduction: false,
};

export default function MidtransSettingsPage() {
    const [settings, setSettings] = useState<MidtransSettings>(defaults);
    const [status, setStatus] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showServerKey, setShowServerKey] = useState(false);
    const [showClientKey, setShowClientKey] = useState(false);

    const load = async () => {
        setIsLoading(true);
        setStatus('');
        try {
            const res = await fetch('/api/admin/midtrans-settings', { credentials: 'include' });
            if (!res.ok) throw new Error('Gagal memuat pengaturan');
            const data = await res.json();
            setSettings({ ...defaults, ...data.settings });
        } catch (err) {
            setStatus(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { void load(); }, []);

    const save = async () => {
        setIsSaving(true);
        setStatus('');
        try {
            const res = await fetch('/api/admin/midtrans-settings', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(settings),
            });
            if (!res.ok) throw new Error('Gagal menyimpan');
            const data = await res.json();
            setSettings({ ...defaults, ...data.settings });
            setStatus('Pengaturan Midtrans tersimpan.');
        } catch (err) {
            setStatus(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setIsSaving(false);
        }
    };

    const mask = (val: string) => {
        if (!val) return '';
        if (val.length <= 8) return '•'.repeat(val.length);
        return val.slice(0, 6) + '•'.repeat(Math.min(val.length - 10, 20)) + val.slice(-4);
    };

    return (
        <section className="space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-text-dark/60">Pengaturan</p>
                    <h2 className="text-2xl font-semibold text-text-dark">Midtrans Payment Gateway</h2>
                    <p className="text-sm text-text-dark/60">
                        Kelola kredensial Midtrans untuk memproses pembayaran. Kunci disimpan terenkripsi di database.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={save}
                        className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isSaving || isLoading}
                    >
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                    <button
                        type="button"
                        onClick={load}
                        className="rounded-xl border border-primary/20 px-4 py-3 text-sm text-text-dark hover:border-secondary"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Memuat...' : 'Muat Ulang'}
                    </button>
                    {status ? (
                        <span className={`text-sm ${status.includes('Gagal') || status.includes('kesalahan') ? 'text-red-600' : 'text-text-dark/60'}`}>
                            {status}
                        </span>
                    ) : null}
                </div>
            </div>

            <div className="grid gap-6">
                {/* Mode */}
                <div className="rounded-2xl border border-primary/20 bg-white p-6">
                    <h3 className="text-lg font-semibold text-text-dark">Mode Lingkungan</h3>
                    <p className="mt-1 text-sm text-text-dark/50">Pilih Sandbox untuk pengujian atau Production untuk transaksi nyata.</p>
                    <div className="mt-5 flex gap-4">
                        <label className={`flex flex-1 items-center gap-3 rounded-xl border px-4 py-4 cursor-pointer transition ${!settings.isProduction ? 'border-primary bg-primary/5' : 'border-primary/20 hover:border-primary/40'}`}>
                            <input
                                type="radio"
                                name="mode"
                                checked={!settings.isProduction}
                                onChange={() => setSettings((prev) => ({ ...prev, isProduction: false }))}
                                className="text-primary"
                            />
                            <div>
                                <p className="font-semibold text-text-dark text-sm">Sandbox</p>
                                <p className="text-xs text-text-dark/50">Mode pengujian — tidak ada transaksi nyata</p>
                            </div>
                            <span className="ml-auto rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">TEST</span>
                        </label>
                        <label className={`flex flex-1 items-center gap-3 rounded-xl border px-4 py-4 cursor-pointer transition ${settings.isProduction ? 'border-emerald-500 bg-emerald-50' : 'border-primary/20 hover:border-primary/40'}`}>
                            <input
                                type="radio"
                                name="mode"
                                checked={settings.isProduction}
                                onChange={() => setSettings((prev) => ({ ...prev, isProduction: true }))}
                                className="text-emerald-600"
                            />
                            <div>
                                <p className="font-semibold text-text-dark text-sm">Production</p>
                                <p className="text-xs text-text-dark/50">Mode live — transaksi nyata diproses</p>
                            </div>
                            <span className="ml-auto rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">LIVE</span>
                        </label>
                    </div>
                    {settings.isProduction && (
                        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                            <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                            <p className="text-xs text-red-600 leading-relaxed">
                                <span className="font-bold">Mode Production aktif.</span> Setiap transaksi akan memproses uang nyata. Pastikan kunci sudah benar sebelum menyimpan.
                            </p>
                        </div>
                    )}
                </div>

                {/* Server Key */}
                <div className="rounded-2xl border border-primary/20 bg-white p-6">
                    <h3 className="text-lg font-semibold text-text-dark">Kunci Server (Server Key)</h3>
                    <p className="mt-1 text-sm text-text-dark/50">
                        Digunakan di backend untuk membuat transaksi. Jangan pernah ekspos ke publik.
                        Format: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">SB-Mid-server-...</code> (sandbox) atau <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">Mid-server-...</code> (production).
                    </p>
                    <div className="mt-4 relative">
                        <input
                            type={showServerKey ? 'text' : 'password'}
                            className="w-full rounded-xl border border-primary/20 bg-white px-4 py-3 pr-12 text-sm text-text-dark font-mono"
                            placeholder={settings.isProduction ? 'Mid-server-xxxxxxxxxxxx' : 'SB-Mid-server-xxxxxxxxxxxx'}
                            value={settings.serverKey}
                            onChange={(e) => setSettings((prev) => ({ ...prev, serverKey: e.target.value }))}
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            onClick={() => setShowServerKey((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dark/40 hover:text-text-dark/70"
                        >
                            {showServerKey ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {settings.serverKey && !showServerKey && (
                        <p className="mt-1.5 text-xs text-text-dark/40">Disimpan: {mask(settings.serverKey)}</p>
                    )}
                </div>

                {/* Client Key */}
                <div className="rounded-2xl border border-primary/20 bg-white p-6">
                    <h3 className="text-lg font-semibold text-text-dark">Kunci Klien (Client Key)</h3>
                    <p className="mt-1 text-sm text-text-dark/50">
                        Digunakan di frontend untuk memuat Snap.js Midtrans.
                        Format: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">SB-Mid-client-...</code> (sandbox) atau <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">Mid-client-...</code> (production).
                    </p>
                    <div className="mt-4 relative">
                        <input
                            type={showClientKey ? 'text' : 'password'}
                            className="w-full rounded-xl border border-primary/20 bg-white px-4 py-3 pr-12 text-sm text-text-dark font-mono"
                            placeholder={settings.isProduction ? 'Mid-client-xxxxxxxxxxxx' : 'SB-Mid-client-xxxxxxxxxxxx'}
                            value={settings.clientKey}
                            onChange={(e) => setSettings((prev) => ({ ...prev, clientKey: e.target.value }))}
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            onClick={() => setShowClientKey((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dark/40 hover:text-text-dark/70"
                        >
                            {showClientKey ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {settings.clientKey && !showClientKey && (
                        <p className="mt-1.5 text-xs text-text-dark/40">Disimpan: {mask(settings.clientKey)}</p>
                    )}
                </div>

                {/* Status Card */}
                <div className={`rounded-2xl border p-6 ${settings.serverKey && settings.clientKey ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                    <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${settings.serverKey && settings.clientKey ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                            {settings.serverKey && settings.clientKey ? (
                                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <p className={`font-semibold text-sm ${settings.serverKey && settings.clientKey ? 'text-emerald-800' : 'text-amber-800'}`}>
                                {settings.serverKey && settings.clientKey
                                    ? `Payment gateway terkonfigurasi — Mode ${settings.isProduction ? 'Production (LIVE)' : 'Sandbox (TEST)'}`
                                    : 'Payment gateway belum dikonfigurasi'}
                            </p>
                            <p className={`text-xs mt-1 ${settings.serverKey && settings.clientKey ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {settings.serverKey && settings.clientKey
                                    ? 'Halaman checkout akan menggunakan kredensial dari admin panel ini.'
                                    : 'Masukkan Server Key dan Client Key Midtrans untuk mengaktifkan pembayaran. Dapatkan kunci di dashboard.midtrans.com.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
