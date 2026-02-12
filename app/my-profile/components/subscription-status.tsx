type SubscriptionStatusProps = {
    planLabel: string;
    status: string;
    nextBillingDate: string;
    isFree: boolean;
};

export default function SubscriptionStatus({ planLabel, status, nextBillingDate, isFree }: SubscriptionStatusProps) {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 transition-all duration-300 h-full">
            <div className="flex items-center gap-2 mb-6 text-primary">
                <span className="material-icons-round text-xl">verified_user</span>
                <h3 className="text-lg font-bold text-gray-900">Status Langganan</h3>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-5 border border-orange-100 mb-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Paket Saat Ini</p>
                        <h4 className="text-2xl font-bold text-gray-900">{planLabel}</h4>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {status}
                    </span>
                </div>

                <div className="mt-4 pt-4 border-t border-orange-100/50 flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                        {isFree ? 'Tidak ada tagihan selanjutnya' : 'Tagihan Berikutnya'}
                    </span>
                    <span className="font-semibold text-gray-900">
                        {nextBillingDate}
                    </span>
                </div>
            </div>

            <a
                href="/pricing"
                className="block w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white text-center font-bold rounded-xl transition-all duration-200 shadow-lg shadow-gray-200"
            >
                {isFree ? 'Upgrade Sekarang' : 'Ganti Paket'}
            </a>
        </div>
    );
}
