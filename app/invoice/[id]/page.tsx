import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { fetchAuthMe } from '@/lib/sso';
import { getSiteSettings } from '@/lib/site-settings';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import PrintButton from './print-button';

type InvoiceSettings = {
    companyName: string;
    companyLogo: string;
    companyAddress: string;
    companyPhone: string;
    companyEmail: string;
    taxId: string;
    footerNote: string;
};

const defaultCompany: InvoiceSettings = {
    companyName: 'PT TaxPrime',
    companyLogo: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: 'support@taxindo.ai',
    taxId: '',
    footerNote: 'Terima kasih telah menggunakan layanan kami.',
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);

export default async function InvoiceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const headerList = await headers();
    const user = await fetchAuthMe(headerList.get('cookie'));

    if (!user?.id) {
        redirect('/login');
    }

    const invoice = await prisma.invoice.findUnique({ where: { id } });

    if (!invoice || (invoice.userId !== user.id && user.role !== 'ADMIN')) {
        redirect('/my-profile/subscriptions');
    }

    const settings = await getSiteSettings(['footer']);

    // Fetch company info from SiteSetting
    const companySetting = await prisma.siteSetting.findUnique({
        where: { key: 'invoice_settings' },
    });
    const company: InvoiceSettings = companySetting
        ? { ...defaultCompany, ...(companySetting.value as object) }
        : defaultCompany;

    const items = (invoice.items as Array<{ description: string; quantity: number; price: number }>) ?? [];

    return (
        <main className="min-h-screen flex flex-col bg-neutral-light text-text-dark">
            <Navbar />

            <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-8 pt-52 mt-20">
                {/* Actions */}
                <div className="flex items-center justify-between mb-8 print:hidden">
                    <Link
                        href="/my-profile/subscriptions"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <span className="material-icons-round text-base">arrow_back</span>
                        Kembali
                    </Link>
                    <PrintButton />
                </div>

                {/* Invoice Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none print:rounded-none">
                    {/* Header */}
                    <div className="p-8 sm:p-10 border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row justify-between gap-6">
                            <div className="flex items-start gap-4">
                                {company.companyLogo && (
                                    <img
                                        src={company.companyLogo}
                                        alt={company.companyName}
                                        className="h-14 w-auto object-contain"
                                    />
                                )}
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">{company.companyName}</h1>
                                    {company.companyAddress && (
                                        <p className="text-xs text-gray-500 mt-1 whitespace-pre-line max-w-xs">
                                            {company.companyAddress}
                                        </p>
                                    )}
                                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                        {company.companyEmail && <p>{company.companyEmail}</p>}
                                        {company.companyPhone && <p>{company.companyPhone}</p>}
                                        {company.taxId && <p>NPWP: {company.taxId}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="text-right sm:text-left">
                                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">INVOICE</h2>
                                <p className="text-sm font-mono text-gray-500 mt-1">{invoice.invoiceNumber}</p>
                                <div className="mt-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${invoice.status === 'PAID'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {invoice.status === 'PAID' ? 'Lunas' : invoice.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="p-8 sm:p-10">
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Tanggal Invoice</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {formatDate(invoice.createdAt)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Tanggal Bayar</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {invoice.paidAt ? formatDate(invoice.paidAt) : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Email Pelanggan</p>
                                <p className="text-sm font-semibold text-gray-900">{invoice.userEmail}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Metode Pembayaran</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {invoice.paymentMethod ?? '-'}
                                </p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table className="w-full text-sm mb-8">
                            <thead>
                                <tr className="border-b-2 border-gray-900">
                                    <th className="text-left py-3 font-bold text-gray-900">Deskripsi</th>
                                    <th className="text-center py-3 font-bold text-gray-900 w-20">Qty</th>
                                    <th className="text-right py-3 font-bold text-gray-900 w-40">Harga</th>
                                    <th className="text-right py-3 font-bold text-gray-900 w-40">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, idx) => (
                                    <tr key={idx} className="border-b border-gray-100">
                                        <td className="py-4 text-gray-700">{item.description}</td>
                                        <td className="py-4 text-center text-gray-700">{item.quantity}</td>
                                        <td className="py-4 text-right text-gray-700">{formatCurrency(item.price)}</td>
                                        <td className="py-4 text-right text-gray-900 font-semibold">
                                            {formatCurrency(item.quantity * item.price)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Total */}
                        <div className="flex justify-end">
                            <div className="w-64">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(invoice.amount)}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b-2 border-gray-900">
                                    <span className="text-lg font-bold text-gray-900">Total</span>
                                    <span className="text-lg font-bold text-gray-900">{formatCurrency(invoice.amount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Note */}
                        {company.footerNote && (
                            <div className="mt-10 pt-6 border-t border-gray-100">
                                <p className="text-xs text-gray-400 italic text-center">{company.footerNote}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="print:hidden">
                <Footer settings={settings.footer} />
            </div>
        </main>
    );
}
