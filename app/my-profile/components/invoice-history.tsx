type Invoice = {
    id: string;
    period: string;
    billedAt: string;
    status: string;
    amount: string;
};

type InvoiceHistoryProps = {
    invoices: Invoice[];
};

export default function InvoiceHistory({ invoices }: InvoiceHistoryProps) {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 transition-all duration-300 h-full">
            <div className="flex items-center gap-2 mb-6 text-primary">
                <span className="material-icons-round text-xl">receipt_long</span>
                <h3 className="text-lg font-bold text-gray-900">Riwayat Tagihan</h3>
            </div>

            <div className="space-y-4">
                {invoices.length > 0 ? (
                    invoices.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <div>
                                <p className="text-xs font-bold text-gray-500 mb-0.5">{invoice.id}</p>
                                <p className="text-sm font-semibold text-gray-900">{invoice.period}</p>
                                <p className="text-xs text-gray-500">{invoice.billedAt}</p>
                            </div>
                            <div className="text-right">
                                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg mb-1">
                                    {invoice.status}
                                </span>
                                <p className="text-sm font-bold text-gray-900">{invoice.amount}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Belum ada tagihan.</p>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <a href="/my-profile/subscriptions" className="text-sm font-semibold text-primary hover:text-orange-600 transition-colors">
                    Lihat Semua Tagihan
                </a>
            </div>
        </div>
    );
}
