'use client';

import Link from 'next/link';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

type KycStatus = 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW';

type KycMe = {
    submission?: {
        id: string;
        status: KycStatus;
        reason?: string | null;
        activeUntil?: string | null;
    } | null;
    studentEligibleUntil?: string | null;
};

const statusCopy: Record<KycStatus, { label: string; tone: string }> = {
    PENDING: { label: 'Menunggu diproses', tone: 'bg-slate-50 text-slate-700 border-slate-200' },
    PROCESSING: { label: 'Sedang diverifikasi', tone: 'bg-blue-50 text-blue-700 border-blue-200' },
    APPROVED: { label: 'Disetujui', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    REJECTED: { label: 'Ditolak', tone: 'bg-red-50 text-red-700 border-red-200' },
    NEEDS_REVIEW: { label: 'Perlu ditinjau admin', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export default function KycClient() {
    const [me, setMe] = useState<KycMe | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const loadMe = async () => {
        try {
            const res = await fetch('/api/kyc/me', { credentials: 'include' });
            if (res.status === 401) {
                setError('Silakan login terlebih dahulu untuk melakukan verifikasi.');
                return;
            }
            if (res.ok) {
                setMe((await res.json()) as KycMe);
            }
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadMe();
    }, []);

    const eligibleUntil = me?.studentEligibleUntil ? new Date(me.studentEligibleUntil) : null;
    const isEligible = eligibleUntil ? eligibleUntil.getTime() > Date.now() : false;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const file = fileRef.current?.files?.[0];
        if (!file) {
            setError('Pilih file kartu pelajar/mahasiswa terlebih dahulu.');
            return;
        }
        setError(null);
        setMessage(null);
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const res = await fetch('/api/kyc/submit', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            if (res.status === 401) {
                setError('Silakan login terlebih dahulu.');
                return;
            }
            if (!res.ok) {
                const data = (await res.json().catch(() => ({}))) as { error?: string };
                setError(data.error ?? 'Gagal mengirim dokumen. Coba lagi.');
                return;
            }
            setMessage('Dokumen berhasil dikirim. Status verifikasi akan diperbarui otomatis.');
            await loadMe();
        } catch {
            setError('Terjadi kesalahan saat mengirim dokumen.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-start justify-center px-4 py-16">
            <div className="w-full max-w-xl">
                <Link href="/pricing" className="inline-flex items-center gap-1.5 text-text-dark/50 text-sm font-medium hover:text-primary transition-colors mb-6">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Kembali ke Harga
                </Link>

                <div className="rounded-3xl border border-emerald-200 bg-white shadow-xl shadow-emerald-100/40 overflow-hidden">
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-600 px-6 md:px-8 py-6 text-white">
                        <h1 className="text-xl font-bold tracking-tight">Verifikasi Status Pelajar (KYC)</h1>
                        <p className="text-emerald-50 text-sm mt-1">
                            Unggah kartu pelajar/mahasiswa untuk mengaktifkan paket Student.
                        </p>
                    </div>

                    <div className="px-6 md:px-8 py-6 space-y-5">
                        {loading ? (
                            <p className="text-sm text-text-dark/50">Memuat status...</p>
                        ) : (
                            <>
                                {/* Eligibility / status */}
                                {isEligible ? (
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                        <p className="font-semibold">Status pelajar terverifikasi ✓</p>
                                        <p className="text-xs mt-1">
                                            Berlaku hingga {eligibleUntil?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.
                                        </p>
                                        <Link
                                            href="/payment?plan=STUDENT&interval=MONTHLY"
                                            className="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500"
                                        >
                                            Lanjut ke Pembayaran Student
                                        </Link>
                                    </div>
                                ) : me?.submission ? (
                                    <div className={`rounded-xl border px-4 py-3 text-sm ${statusCopy[me.submission.status].tone}`}>
                                        <p className="font-semibold">Status: {statusCopy[me.submission.status].label}</p>
                                        {me.submission.reason ? (
                                            <p className="text-xs mt-1">Catatan: {me.submission.reason}</p>
                                        ) : null}
                                    </div>
                                ) : null}

                                {/* Submit form */}
                                {!isEligible ? (
                                    <form className="space-y-4" onSubmit={handleSubmit}>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Kartu Pelajar / Mahasiswa
                                            </label>
                                            <input
                                                ref={fileRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                                className="w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-white file:text-sm file:font-semibold hover:file:bg-emerald-500"
                                            />
                                            <p className="mt-1.5 text-xs text-gray-500">
                                                Format: JPG, PNG, WEBP, atau PDF. Pastikan nama sesuai dengan akun Anda.
                                            </p>
                                        </div>

                                        {message ? (
                                            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">
                                                {message}
                                            </p>
                                        ) : null}
                                        {error ? (
                                            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
                                                {error}
                                            </p>
                                        ) : null}

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full rounded-xl bg-emerald-600 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? 'Mengirim...' : 'Kirim untuk Verifikasi'}
                                        </button>
                                    </form>
                                ) : null}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
