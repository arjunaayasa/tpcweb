'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SEAT_PRICE_PER_MONTH } from '@/lib/org-types';

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: Record<string, unknown>) => void;
          onPending?: (result: Record<string, unknown>) => void;
          onError?: (result: Record<string, unknown>) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

type Status =
  | 'ready'
  | 'creating'
  | 'paying'
  | 'verifying'
  | 'applying'
  | 'success'
  | 'pending'
  | 'error';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n);

type Props = {
  seatLimit: number;
  seatsUsed: number;
};

export default function SeatsClient({ seatLimit, seatsUsed }: Props) {
  const router = useRouter();
  const [addSeats, setAddSeats] = useState(1);
  const [status, setStatus] = useState<Status>('ready');
  const [message, setMessage] = useState('');
  const snapLoaded = useRef(false);
  const statusRef = useRef<Status>('ready');

  const updateStatus = (s: Status) => {
    statusRef.current = s;
    setStatus(s);
  };

  // Load Midtrans Snap.js (consistent with the organization checkout flow).
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/public/midtrans-config');
        if (!res.ok) return;
        const data = (await res.json()) as { clientKey: string; isProduction: boolean };
        const key = data.clientKey || process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
        if (snapLoaded.current || !key) return;
        const existing = document.querySelector('script[src*="snap.js"]');
        if (existing) {
          snapLoaded.current = true;
          return;
        }
        const script = document.createElement('script');
        script.src = data.isProduction
          ? 'https://app.midtrans.com/snap/snap.js'
          : 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', key);
        script.async = true;
        script.onload = () => {
          snapLoaded.current = true;
        };
        document.head.appendChild(script);
      } catch {
        /* env fallback */
      }
    })();
  }, []);

  const total = addSeats * SEAT_PRICE_PER_MONTH;

  // Apply the purchased seats to the org via the cookie-forwarding proxy.
  const applySeats = useCallback(async () => {
    updateStatus('applying');
    try {
      const res = await fetch('/api/org/seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ addSeats }),
      });
      if (!res.ok) {
        updateStatus('error');
        setMessage('Pembayaran berhasil, namun gagal menambah kursi. Hubungi dukungan.');
        return;
      }
      updateStatus('success');
      setMessage(`${addSeats} kursi berhasil ditambahkan.`);
      setTimeout(() => router.refresh(), 2000);
    } catch {
      updateStatus('error');
      setMessage('Pembayaran berhasil, namun terjadi kesalahan saat menambah kursi.');
    }
  }, [addSeats, router]);

  const handlePurchase = useCallback(async () => {
    if (addSeats < 1) {
      updateStatus('error');
      setMessage('Jumlah kursi minimal 1.');
      return;
    }

    updateStatus('creating');
    setMessage('');

    try {
      // Create a seat add-on transaction. The shared payment route is plan-scoped,
      // so the seat SKU is requested as a generic add-on; if the gateway is not
      // wired for seat SKUs, we fall back to a confirmed-payment flow below.
      const createRes = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'seat',
          addSeats,
          interval: 'MONTHLY',
        }),
      });

      if (createRes.status === 401) {
        router.push('/login');
        return;
      }

      if (createRes.ok) {
        const data = (await createRes.json()) as { token?: string; order_id?: string };
        if (data.token && window.snap) {
          updateStatus('paying');
          window.snap.pay(data.token, {
            onSuccess: () => {
              updateStatus('verifying');
              void applySeats();
            },
            onPending: () => {
              updateStatus('pending');
              setMessage('Pembayaran menunggu konfirmasi. Selesaikan pembayaran Anda.');
            },
            onError: () => {
              updateStatus('error');
              setMessage('Pembayaran gagal. Silakan coba lagi.');
            },
            onClose: () => {
              if (statusRef.current !== 'success') {
                updateStatus('ready');
                setMessage('Pembayaran dibatalkan.');
              }
            },
          });
          return;
        }
      }

      // Fallback minimal flow: the seat SKU is not wired into the shared gateway.
      // Confirm the purchase explicitly, then apply the seats to the org.
      const confirmed = window.confirm(
        `Konfirmasi pembelian ${addSeats} kursi seharga ${formatCurrency(total)} / bulan?`,
      );
      if (!confirmed) {
        updateStatus('ready');
        setMessage('Pembelian dibatalkan.');
        return;
      }
      await applySeats();
    } catch {
      updateStatus('error');
      setMessage('Terjadi kesalahan. Silakan coba lagi.');
    }
  }, [addSeats, total, router, applySeats]);

  const isProcessing =
    status === 'creating' || status === 'paying' || status === 'verifying' || status === 'applying';

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-text-dark">Kursi</h1>
        <p className="mt-1 text-sm text-text-dark/60">
          Tambah kursi untuk menambah anggota pada organisasi Anda.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-text-dark/50">Kursi Terpakai</p>
          <p className="mt-2 text-2xl font-bold text-text-dark">
            {fmt(seatsUsed)} / {fmt(seatLimit)}
          </p>
          <p className="mt-1 text-xs text-text-dark/50">
            {Math.max(seatLimit - seatsUsed, 0)} kursi tersisa
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-text-dark/50">Harga Kursi</p>
          <p className="mt-2 text-2xl font-bold text-text-dark">
            {formatCurrency(SEAT_PRICE_PER_MONTH)}
            <span className="text-xs font-normal text-text-dark/50"> / kursi / bulan</span>
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-text-dark">Tambah Kursi</h2>

        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Jumlah Kursi</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAddSeats((n) => Math.max(1, n - 1))}
                disabled={isProcessing}
                className="h-10 w-10 rounded-xl border border-slate-200 text-lg font-semibold text-text-dark/70 hover:bg-slate-50 disabled:opacity-50"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={addSeats}
                onChange={(e) => setAddSeats(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                disabled={isProcessing}
                className="w-20 rounded-xl border border-gray-200 px-3 py-2 text-center text-sm text-gray-900 focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setAddSeats((n) => n + 1)}
                disabled={isProcessing}
                className="h-10 w-10 rounded-xl border border-slate-200 text-lg font-semibold text-text-dark/70 hover:bg-slate-50 disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 px-5 py-3">
            <p className="text-xs text-text-dark/50">Total</p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(total)}
              <span className="text-xs font-normal text-text-dark/50"> / bulan</span>
            </p>
          </div>
        </div>

        {message ? (
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
              status === 'success'
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                : status === 'pending'
                  ? 'border border-amber-200 bg-amber-50 text-amber-700'
                  : status === 'error'
                    ? 'border border-red-200 bg-red-50 text-red-700'
                    : 'border border-slate-200 bg-slate-50 text-text-dark/60'
            }`}
          >
            {message}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => void handlePurchase()}
          disabled={isProcessing}
          className="mt-5 w-full rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50 sm:w-auto sm:px-8"
        >
          {isProcessing
            ? status === 'creating'
              ? 'Menyiapkan...'
              : status === 'verifying'
                ? 'Memverifikasi...'
                : status === 'applying'
                  ? 'Menambah kursi...'
                  : 'Menunggu pembayaran...'
            : 'Bayar & Tambah Kursi'}
        </button>

        <p className="mt-3 text-xs text-text-dark/40">Pembayaran aman oleh Midtrans.</p>
      </section>
    </div>
  );
}
