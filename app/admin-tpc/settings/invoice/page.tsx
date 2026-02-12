'use client';

import { useEffect, useState } from 'react';

type InvoiceSettings = {
    companyName: string;
    companyLogo: string;
    companyAddress: string;
    companyPhone: string;
    companyEmail: string;
    taxId: string;
    footerNote: string;
};

const defaults: InvoiceSettings = {
    companyName: '',
    companyLogo: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    taxId: '',
    footerNote: '',
};

export default function InvoiceSettingsPage() {
    const [settings, setSettings] = useState<InvoiceSettings>(defaults);
    const [status, setStatus] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const load = async () => {
        setIsLoading(true);
        setStatus('');
        try {
            const res = await fetch('/api/admin/invoice-settings', { credentials: 'include' });
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
            const res = await fetch('/api/admin/invoice-settings', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(settings),
            });
            if (!res.ok) throw new Error('Gagal menyimpan');
            const data = await res.json();
            setSettings({ ...defaults, ...data.settings });
            setStatus('Pengaturan invoice tersimpan.');
        } catch (err) {
            setStatus(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setIsSaving(false);
        }
    };

    const field = (label: string, key: keyof InvoiceSettings, type: 'input' | 'textarea' = 'input') => (
        <label key={key} className="flex flex-col gap-2 text-sm text-text-dark">
            {label}
            {type === 'textarea' ? (
                <textarea
                    className="min-h-[90px] rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                    value={settings[key]}
                    onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                />
            ) : (
                <input
                    className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                    value={settings[key]}
                    onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                />
            )}
        </label>
    );

    return (
        <section className="space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-text-dark/60">Pengaturan</p>
                    <h2 className="text-2xl font-semibold text-text-dark">Invoice Settings</h2>
                    <p className="text-sm text-text-dark/60">
                        Atur informasi perusahaan yang ditampilkan pada invoice.
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
                    {status ? <span className="text-sm text-text-dark/60">{status}</span> : null}
                </div>
            </div>

            <div className="grid gap-6">
                <div className="rounded-2xl border border-primary/20 bg-white p-6">
                    <h3 className="text-lg font-semibold text-text-dark">Informasi Perusahaan</h3>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {field('Nama Perusahaan', 'companyName')}
                        {field('URL Logo Perusahaan', 'companyLogo')}
                        {field('Email Perusahaan', 'companyEmail')}
                        {field('No. Telepon', 'companyPhone')}
                        {field('NPWP / Tax ID', 'taxId')}
                    </div>
                    <div className="mt-4">
                        {field('Alamat Perusahaan', 'companyAddress', 'textarea')}
                    </div>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-white p-6">
                    <h3 className="text-lg font-semibold text-text-dark">Catatan Invoice</h3>
                    <div className="mt-4">
                        {field('Catatan Kaki Invoice', 'footerNote', 'textarea')}
                    </div>
                </div>

                {settings.companyName && (
                    <div className="rounded-2xl border border-primary/20 bg-white p-6">
                        <h3 className="text-lg font-semibold text-text-dark mb-4">Preview</h3>
                        <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                            <div className="flex items-center gap-4 mb-4">
                                {settings.companyLogo && (
                                    <img src={settings.companyLogo} alt="Logo" className="h-12 w-auto object-contain" />
                                )}
                                <div>
                                    <p className="text-lg font-bold text-gray-900">{settings.companyName}</p>
                                    {settings.companyAddress && (
                                        <p className="text-xs text-gray-500 whitespace-pre-line">{settings.companyAddress}</p>
                                    )}
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 space-y-0.5">
                                {settings.companyEmail && <p>Email: {settings.companyEmail}</p>}
                                {settings.companyPhone && <p>Telp: {settings.companyPhone}</p>}
                                {settings.taxId && <p>NPWP: {settings.taxId}</p>}
                            </div>
                            {settings.footerNote && (
                                <p className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-400 italic">
                                    {settings.footerNote}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
