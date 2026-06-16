import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { fetchAuthProfile } from '@/lib/sso';
import { getSiteSettings } from '@/lib/site-settings';
import { getPlanCycle, getBillingWindow, formatDate } from '@/lib/billing';
import { prisma } from '@/lib/prisma';
import ProfileCard from '../components/profile-card';
import QuickAccess from '../components/quick-access';
import HelpSupport from '../components/help-support';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default async function ManageSubscriptionsPage() {
  const headerList = await headers();
  const profile = await fetchAuthProfile(headerList.get('cookie'));

  if (!profile?.user) {
    redirect('/login');
  }

  const settings = await getSiteSettings(['footer']);
  const { user, plan } = profile;

  // Plan Labels
  const planLabels: Record<string, string> = {
    FREE: 'Free',
    FREE_LOGIN: 'Free',
    UMKM: 'UMKM',
    ENTERPRISE: 'Enterprise',
    MNC: 'MNC',
    BASIC: 'Basic',
    PLUS: 'Plus',
    MAX: 'Max',
  };

  const userPlan = user.plan ?? 'FREE';
  const planLabel = planLabels[userPlan] ?? (userPlan);
  const isFree = userPlan === 'FREE' || userPlan === 'FREE_LOGIN';

  // Billing Logic
  const cycle = getPlanCycle(plan ?? null);
  const now = new Date();
  const startDate = user.createdAt ? new Date(user.createdAt) : now;
  const { next } = getBillingWindow(startDate, cycle, now);

  const intervalParam = cycle === 'ANNUAL' ? 'YEARLY' : 'MONTHLY';

  // Renew Logic
  const msUntilRenew = next.getTime() - now.getTime();
  const daysUntilRenew = Math.ceil(msUntilRenew / (1000 * 60 * 60 * 24));
  const renewEnabled = !isFree && daysUntilRenew <= 7;
  const renewOpenDate = new Date(next.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Fetch real invoices from database
  const invoices = await prisma.invoice.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Get latest invoice price for display
  const latestInvoice = invoices[0];
  const planPrice = latestInvoice
    ? formatCurrency(latestInvoice.amount)
    : (isFree ? 'Rp 0' : '-');

  return (
    <main className="min-h-screen flex flex-col bg-neutral-light text-text-dark transition-colors duration-300">
      <Navbar />

      <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-8 pt-52 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* Left Column (Sidebar) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <ProfileCard user={user} planLabel={planLabel} />
            <QuickAccess />
            <HelpSupport />
          </div>

          {/* Right Column (Content) */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Kelola Langganan</h1>
                <p className="text-gray-500 mt-1">Atur paket langganan dan metode pembayaran Anda.</p>
              </div>
              <Link
                href="/my-profile"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <span className="material-icons-round text-base">arrow_back</span>
                Kembali
              </Link>
            </div>

            {/* Active Plan Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 sm:p-8 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-300 text-sm font-medium mb-1">Paket Saat Ini</p>
                    <h2 className="text-3xl font-bold tracking-tight">{planLabel}</h2>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${!isFree ? 'bg-green-500/20 text-green-300' : 'bg-gray-600/50 text-gray-300'
                    }`}>
                    {isFree ? 'Free' : 'Aktif'}
                  </span>
                </div>
                {!isFree && (
                  <div className="mt-6 flex flex-wrap gap-6 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Tagihan</p>
                      <p className="font-semibold text-xl">{planPrice} <span className="text-sm font-normal text-gray-400">/ {cycle === 'ANNUAL' ? 'tahun' : 'bulan'}</span></p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Tagihan Berikutnya</p>
                      <p className="font-semibold text-white">{formatDate(next)}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 sm:p-8 bg-white">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/pricing"
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all"
                  >
                    <span className="material-icons-round text-sm">upgrade</span>
                    {isFree ? 'Upgrade Plan' : 'Ganti Paket (Upgrade/Downgrade)'}
                  </Link>

                  {!isFree && (
                    renewEnabled ? (
                      <Link
                        href={`/payment?plan=${userPlan}&interval=${intervalParam}`}
                        className="flex-1 flex items-center justify-center gap-2 border border-secondary text-secondary hover:bg-secondary/5 font-bold py-3 px-6 rounded-xl transition-all"
                      >
                        <span className="material-icons-round text-sm">autorenew</span>
                        Perpanjang Langganan
                      </Link>
                    ) : (
                      <div className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-400 font-bold py-3 px-6 rounded-xl cursor-not-allowed bg-gray-50" title={`Tersedia mulai ${formatDate(renewOpenDate)}`}>
                        <span className="material-icons-round text-sm">lock_clock</span>
                        Perpanjang (H-7)
                      </div>
                    )
                  )}
                </div>
                <p className="text-center text-xs text-gray-400 mt-4">
                  Hubungi <a href="mailto:support@taxindo.ai" className="text-primary hover:underline">Support</a> jika Anda butuh bantuan pembatalan.
                </p>
              </div>
            </div>

            {/* Payment Method & Billing Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4 text-gray-900">
                  <span className="material-icons-round text-gray-400">credit_card</span>
                  <h3 className="font-bold text-lg">Metode Pembayaran</h3>
                </div>
                {!isFree ? (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <span className="material-icons-round text-blue-600">payment</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Online Payment</p>
                      <p className="text-xs text-gray-500">via Midtrans</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Tidak ada metode pembayaran aktif.</p>
                )}
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4 text-gray-900">
                  <span className="material-icons-round text-gray-400">event_repeat</span>
                  <h3 className="font-bold text-lg">Siklus Penagihan</h3>
                </div>
                <p className="text-sm text-gray-600">
                  {isFree ? 'Anda menggunakan paket gratis.' : `Ditagih secara otomatis setiap ${cycle === 'ANNUAL' ? 'tahun' : 'bulan'}.`}
                </p>
                {!isFree && (
                  <div className="mt-3">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded">
                      {cycle === 'ANNUAL' ? 'YEARLY' : 'MONTHLY'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice History */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6 text-gray-900">
                <span className="material-icons-round text-gray-400">receipt_long</span>
                <h3 className="font-bold text-lg">Riwayat Tagihan</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 font-semibold">No. Invoice</th>
                      <th className="px-4 py-3 font-semibold">Tanggal</th>
                      <th className="px-4 py-3 font-semibold">Paket</th>
                      <th className="px-4 py-3 font-semibold">Jumlah</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoices.length > 0 ? (
                      invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-4 font-medium text-gray-900">{invoice.invoiceNumber}</td>
                          <td className="px-4 py-4 text-gray-500">{formatDate(invoice.createdAt)}</td>
                          <td className="px-4 py-4 text-gray-700">{planLabels[invoice.plan] ?? invoice.plan}</td>
                          <td className="px-4 py-4 text-gray-900">{formatCurrency(invoice.amount)}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${invoice.status === 'PAID'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {invoice.status === 'PAID' ? 'Lunas' : invoice.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Link
                              href={`/invoice/${invoice.id}`}
                              className="text-primary hover:text-orange-700 font-medium text-xs"
                            >
                              Lihat Detail
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          Belum ada riwayat tagihan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer settings={settings.footer} />
    </main>
  );
}

