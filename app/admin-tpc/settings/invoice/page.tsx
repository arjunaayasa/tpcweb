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
    // Pengaturan Pajak
    taxEnabled: boolean;
    taxType: string;
    taxRate: number;
    taxLabel: string;
    taxIncluded: boolean;
    stampDutyEnabled: boolean;
    stampDutyThreshold: number;
    stampDutyAmount: number;
    additionalTaxId: string;
    taxOffice: string;
    taxOfficerName: string;
};

const defaults: InvoiceSettings = {
    companyName: '',
    companyLogo: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    taxId: '',
    footerNote: '',
    taxEnabled: false,
    taxType: 'PPN',
    taxRate: 11,
    taxLabel: 'PPN 11%',
    taxIncluded: false,
    stampDutyEnabled: false,
    stampDutyThreshold: 5000000,
    stampDutyAmount: 10000,
    additionalTaxId: '',
    taxOffice: '',
    taxOfficerName: '',
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
                {/* Informasi Perusahaan */}
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

                {/* Pengaturan Pajak Invoice */}
                <div className="rounded-2xl border border-primary/20 bg-white p-6">
                    <h3 className="text-lg font-semibold text-text-dark">Pengaturan Pajak Invoice</h3>
                    <p className="mt-1 text-sm text-text-dark/50">Konfigurasi jenis dan perhitungan pajak yang ditampilkan di invoice.</p>

                    {/* Toggle aktif pajak */}
                    <div className="mt-5 flex items-center justify-between rounded-xl border border-primary/20 bg-neutral-light px-4 py-3">
                        <div>
                            <p className="text-sm font-medium text-text-dark">Aktifkan Pajak</p>
                            <p className="text-xs text-text-dark/50">Tambahkan baris pajak ke setiap invoice yang diterbitkan.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSettings((prev) => ({ ...prev, taxEnabled: !prev.taxEnabled }))}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${settings.taxEnabled ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${settings.taxEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                        </button>
                    </div>

                    {settings.taxEnabled && (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            {/* Jenis Pajak */}
                            <label className="flex flex-col gap-2 text-sm text-text-dark">
                                Jenis Pajak
                                <select
                                    className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                                    value={settings.taxType}
                                    onChange={(e) => {
                                        const taxType = e.target.value;
                                        let rate = settings.taxRate;
                                        let label = settings.taxLabel;
                                        if (taxType === 'PPN') { rate = 11; label = 'PPN 11%'; }
                                        else if (taxType === 'PPh 23') { rate = 2; label = 'PPh 23 2%'; }
                                        else if (taxType === 'PPh 4(2)') { rate = 0.5; label = 'PPh 4(2) 0.5%'; }
                                        setSettings((prev) => ({ ...prev, taxType, taxRate: rate, taxLabel: label }));
                                    }}
                                >
                                    <option value="PPN">PPN (Pajak Pertambahan Nilai)</option>
                                    <option value="PPh 23">PPh 23 (Pajak Penghasilan Pasal 23)</option>
                                    <option value="PPh 4(2)">PPh 4(2) (Final)</option>
                                    <option value="Bebas">Bebas / Kustom</option>
                                </select>
                            </label>

                            {/* Tarif */}
                            <label className="flex flex-col gap-2 text-sm text-text-dark">
                                Tarif Pajak (%)
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.5}
                                    className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                                    value={settings.taxRate}
                                    onChange={(e) => {
                                        const rate = parseFloat(e.target.value) || 0;
                                        setSettings((prev) => ({ ...prev, taxRate: rate }));
                                    }}
                                />
                            </label>

                            {/* Label Pajak */}
                            <label className="flex flex-col gap-2 text-sm text-text-dark">
                                Label Pajak di Invoice
                                <input
                                    className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                                    placeholder="Contoh: PPN 11%"
                                    value={settings.taxLabel}
                                    onChange={(e) => setSettings((prev) => ({ ...prev, taxLabel: e.target.value }))}
                                />
                                <span className="text-xs text-text-dark/40">Teks yang ditampilkan pada baris pajak di invoice.</span>
                            </label>

                            {/* Inclusive / Exclusive */}
                            <div className="flex flex-col gap-2 text-sm text-text-dark">
                                Metode Perhitungan Pajak
                                <div className="flex flex-col gap-2">
                                    <label className="flex items-center gap-3 rounded-xl border border-primary/20 bg-neutral-light px-4 py-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="taxIncluded"
                                            checked={!settings.taxIncluded}
                                            onChange={() => setSettings((prev) => ({ ...prev, taxIncluded: false }))}
                                            className="text-primary"
                                        />
                                        <div>
                                            <p className="font-medium">Exclusive (ditambahkan)</p>
                                            <p className="text-xs text-text-dark/50">Pajak dihitung di atas harga & ditampilkan terpisah.</p>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 rounded-xl border border-primary/20 bg-neutral-light px-4 py-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="taxIncluded"
                                            checked={settings.taxIncluded}
                                            onChange={() => setSettings((prev) => ({ ...prev, taxIncluded: true }))}
                                            className="text-primary"
                                        />
                                        <div>
                                            <p className="font-medium">Inclusive (sudah termasuk)</p>
                                            <p className="text-xs text-text-dark/50">Harga sudah mencakup pajak, ditampilkan informatif.</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bea Meterai */}
                <div className="rounded-2xl border border-primary/20 bg-white p-6">
                    <h3 className="text-lg font-semibold text-text-dark">Bea Meterai</h3>
                    <p className="mt-1 text-sm text-text-dark/50">Kenakan bea meterai otomatis pada invoice di atas nilai tertentu (UU No. 10 Tahun 2020).</p>

                    <div className="mt-5 flex items-center justify-between rounded-xl border border-primary/20 bg-neutral-light px-4 py-3">
                        <div>
                            <p className="text-sm font-medium text-text-dark">Aktifkan Bea Meterai</p>
                            <p className="text-xs text-text-dark/50">Tambahkan bea meterai Rp10.000 untuk invoice di atas Rp5.000.000.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSettings((prev) => ({ ...prev, stampDutyEnabled: !prev.stampDutyEnabled }))}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${settings.stampDutyEnabled ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${settings.stampDutyEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                        </button>
                    </div>

                    {settings.stampDutyEnabled && (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <label className="flex flex-col gap-2 text-sm text-text-dark">
                                Batas Nilai Invoice (IDR)
                                <input
                                    type="number"
                                    min={0}
                                    step={100000}
                                    className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                                    value={settings.stampDutyThreshold}
                                    onChange={(e) => setSettings((prev) => ({ ...prev, stampDutyThreshold: parseFloat(e.target.value) || 0 }))}
                                />
                                <span className="text-xs text-text-dark/40">Invoice di atas nilai ini akan dikenai bea meterai.</span>
                            </label>
                            <label className="flex flex-col gap-2 text-sm text-text-dark">
                                Nominal Bea Meterai (IDR)
                                <input
                                    type="number"
                                    min={0}
                                    step={1000}
                                    className="rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm text-text-dark"
                                    value={settings.stampDutyAmount}
                                    onChange={(e) => setSettings((prev) => ({ ...prev, stampDutyAmount: parseFloat(e.target.value) || 0 }))}
                                />
                            </label>
                        </div>
                    )}
                </div>

                {/* Data PKP & KPP */}
                <div className="rounded-2xl border border-primary/20 bg-white p-6">
                    <h3 className="text-lg font-semibold text-text-dark">Data PKP & KPP</h3>
                    <p className="mt-1 text-sm text-text-dark/50">Informasi tambahan untuk keperluan faktur pajak dan kepatuhan perpajakan.</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {field('Nomor Pengukuhan PKP', 'additionalTaxId')}
                        {field('KPP / Kantor Pajak Terdaftar', 'taxOffice')}
                        {field('Nama Penanggung Jawab Pajak', 'taxOfficerName')}
                    </div>
                </div>

                {/* Catatan Invoice */}
                <div className="rounded-2xl border border-primary/20 bg-white p-6">
                    <h3 className="text-lg font-semibold text-text-dark">Catatan Invoice</h3>
                    <div className="mt-4">
                        {field('Catatan Kaki Invoice', 'footerNote', 'textarea')}
                    </div>
                </div>

                {/* Preview */}
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
                                {settings.additionalTaxId && <p>No. PKP: {settings.additionalTaxId}</p>}
                                {settings.taxOffice && <p>KPP: {settings.taxOffice}</p>}
                            </div>
                            {/* Contoh baris pajak */}
                            {(settings.taxEnabled || settings.stampDutyEnabled) && (
                                <div className="mt-4 pt-4 border-t border-gray-200 space-y-1 text-xs text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>Rp 1.000.000</span>
                                    </div>
                                    {settings.taxEnabled && (
                                        <div className="flex justify-between text-orange-600">
                                            <span>{settings.taxLabel}{settings.taxIncluded ? ' (sudah termasuk)' : ''}</span>
                                            <span>{settings.taxIncluded ? '—' : `Rp ${(1000000 * settings.taxRate / 100).toLocaleString('id-ID')}`}</span>
                                        </div>
                                    )}
                                    {settings.stampDutyEnabled && (
                                        <div className="flex justify-between text-blue-600">
                                            <span>Bea Meterai</span>
                                            <span>Rp {settings.stampDutyAmount.toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold pt-1 border-t border-gray-200">
                                        <span>Total</span>
                                        <span>
                                            Rp {(
                                                1000000 +
                                                (settings.taxEnabled && !settings.taxIncluded ? 1000000 * settings.taxRate / 100 : 0) +
                                                (settings.stampDutyEnabled ? settings.stampDutyAmount : 0)
                                            ).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            )}
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
