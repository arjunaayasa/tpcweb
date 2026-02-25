import Link from 'next/link';

type AiAddonStatusProps = {
    effectiveAddon: string;
    aiAddon: string;
    aiAddonExpiry: string | null;
};

const addonLabels: Record<string, string> = {
    NONE: 'Tidak Ada',
    STARTER: 'AI Starter',
    PRO: 'AI Pro',
    UNLIMITED: 'AI Unlimited',
};

const addonColors: Record<string, { bg: string; border: string; badge: string; text: string; gradient: string }> = {
    NONE: { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-600', text: 'text-gray-600', gradient: 'from-gray-100 to-gray-50' },
    STARTER: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-700', gradient: 'from-emerald-100 to-emerald-50' },
    PRO: { bg: 'bg-teal-50', border: 'border-teal-200', badge: 'bg-teal-100 text-teal-700', text: 'text-teal-700', gradient: 'from-teal-100 to-teal-50' },
    UNLIMITED: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800', text: 'text-amber-800', gradient: 'from-amber-100 to-amber-50' },
};

const addonFeatures: Record<string, string[]> = {
    NONE: ['Tidak ada akses AI'],
    STARTER: ['Owlie Lite', 'Owlie Chat v1.5'],
    PRO: ['Owlie Lite', 'Owlie Chat v1.5', 'Owlie Thinking v1.5'],
    UNLIMITED: ['Owlie Lite', 'Owlie Chat v1.5', 'Owlie Thinking v1.5', 'Owlie Max v1.5'],
};

function formatExpiryDate(expiry: string | null): string {
    if (!expiry) return 'Tidak terbatas';
    const date = new Date(expiry);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getDaysRemaining(expiry: string | null): number | null {
    if (!expiry) return null;
    const now = new Date();
    const exp = new Date(expiry);
    const diff = exp.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function AiAddonStatus({ effectiveAddon, aiAddon, aiAddonExpiry }: AiAddonStatusProps) {
    const isExpired = effectiveAddon === 'NONE' && aiAddon !== 'NONE';
    const hasAddon = effectiveAddon !== 'NONE';
    const colors = addonColors[effectiveAddon] || addonColors.NONE;
    const features = addonFeatures[effectiveAddon] || addonFeatures.NONE;
    const daysLeft = getDaysRemaining(aiAddonExpiry);
    const isTrialWarning = daysLeft !== null && daysLeft <= 3 && daysLeft > 0;

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 transition-all duration-300 h-full">
            <div className="flex items-center gap-2 mb-6 text-primary">
                <span className="material-icons-round text-xl">smart_toy</span>
                <h3 className="text-lg font-bold text-gray-900">AI Add-on</h3>
            </div>

            <div className={`bg-gradient-to-br ${colors.gradient} rounded-2xl p-5 border ${colors.border} mb-4`}>
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Add-on Saat Ini</p>
                        <h4 className={`text-2xl font-bold ${hasAddon ? colors.text : 'text-gray-400'}`}>
                            {addonLabels[effectiveAddon] || effectiveAddon}
                        </h4>
                    </div>
                    {isExpired ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-100 text-red-700">
                            Kedaluwarsa
                        </span>
                    ) : hasAddon ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colors.badge}`}>
                            Aktif
                        </span>
                    ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-gray-100 text-gray-500">
                            Nonaktif
                        </span>
                    )}
                </div>

                {/* Expiry info */}
                {hasAddon && aiAddonExpiry && (
                    <div className={`mt-3 pt-3 border-t ${colors.border} flex justify-between items-center text-sm`}>
                        <span className="text-gray-500">Berlaku hingga</span>
                        <span className={`font-semibold ${isTrialWarning ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatExpiryDate(aiAddonExpiry)}
                            {daysLeft !== null && daysLeft > 0 && (
                                <span className={`ml-1 text-xs ${isTrialWarning ? 'text-red-500' : 'text-gray-400'}`}>
                                    ({daysLeft} hari lagi)
                                </span>
                            )}
                        </span>
                    </div>
                )}
                {hasAddon && !aiAddonExpiry && (
                    <div className={`mt-3 pt-3 border-t ${colors.border} flex justify-between items-center text-sm`}>
                        <span className="text-gray-500">Masa berlaku</span>
                        <span className="font-semibold text-gray-900">Tidak terbatas</span>
                    </div>
                )}

                {/* Model list */}
                {hasAddon && (
                    <div className="mt-4 pt-3 border-t border-inherit">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Model AI Tersedia</p>
                        <div className="flex flex-wrap gap-1.5">
                            {features.map((f) => (
                                <span key={f} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${colors.badge}`}>
                                    {f}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Trial warning */}
            {isTrialWarning && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100">
                    <p className="text-xs text-red-600 font-medium">
                        Trial Anda akan berakhir dalam {daysLeft} hari. Upgrade untuk tetap mengakses AI.
                    </p>
                </div>
            )}

            {/* Expired notice */}
            {isExpired && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100">
                    <p className="text-xs text-red-600 font-medium">
                        AI Add-on Anda ({addonLabels[aiAddon]}) telah kedaluwarsa. Perpanjang untuk mengakses AI lagi.
                    </p>
                </div>
            )}

            <Link
                href="/pricing"
                className="block w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white text-center font-bold rounded-xl transition-all duration-200 shadow-lg shadow-gray-200"
            >
                {!hasAddon ? 'Beli AI Add-on' : 'Upgrade AI Add-on'}
            </Link>
        </div>
    );
}
