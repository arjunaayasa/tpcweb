type UsageStatsProps = {
    usage: Record<string, number>;
    limits: Record<string, number | null>;
};

export default function UsageStats({ usage, limits }: UsageStatsProps) {
    const models = [
        { key: 'owlie-loc', label: 'Owlie Lite', color: 'bg-teal-400' },
        { key: 'owlie-chat', label: 'Owlie Chat', color: 'bg-blue-400' },
        { key: 'owlie-thinking', label: 'Owlie Thinking', color: 'bg-purple-400' },
        { key: 'owlie-max', label: 'Owlie Max', color: 'bg-orange-400' },
    ];

    const getUsagePercentage = (key: string) => {
        const used = usage[key] || 0;
        const limit = limits[key];
        if (limit === null || limit === undefined) return 0; // Unlimited or unknown
        return Math.min(100, (used / limit) * 100);
    };

    const formatLimit = (limit: number | null | undefined) => {
        return limit === null || limit === undefined ? '∞' : limit;
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 flex-grow transition-all duration-300">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                        Statistik Penggunaan AI
                    </h2>
                    <p className="text-sm text-gray-500">Periode: {new Date().toISOString().slice(0, 7)}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-primary">
                    <span className="material-icons-round">analytics</span>
                </div>
            </div>
            <div className="space-y-8">
                {models.map((model) => (
                    <div key={model.key}>
                        <div className="flex justify-between items-end mb-2">
                            <h4 className="font-semibold text-gray-900">{model.label}</h4>
                            <span className="text-sm font-bold text-primary">
                                {usage[model.key] || 0}{' '}
                                <span className="text-gray-400 font-normal">
                                    / {formatLimit(limits[model.key])}
                                </span>
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
                            <div
                                className={`${model.color} h-3 rounded-full transition-all duration-500`}
                                style={{ width: `${getUsagePercentage(model.key)}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500">
                            {limits[model.key] === null
                                ? 'Anda memiliki akses unlimited untuk model ini.'
                                : `Sisa kuota: ${(limits[model.key] || 0) - (usage[model.key] || 0)
                                }`}
                        </p>
                    </div>
                ))}
            </div>
        </div>

    );
}
