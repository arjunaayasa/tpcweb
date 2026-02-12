export default function HelpSupport() {
    const supports = [
        { label: 'Hubungi Support', href: 'mailto:support@taxindo.ai', icon: 'support_agent' },
        { label: 'Pusat Bantuan', href: '/faq', icon: 'help_outline' },
    ];

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 transition-all duration-300">
            <div className="flex items-center gap-2 mb-6 text-primary">
                <span className="material-icons-round text-xl">help</span>
                <h3 className="text-lg font-bold text-gray-900">Bantuan</h3>
            </div>
            <div className="space-y-3">
                {supports.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-orange-50 border border-gray-100 hover:border-orange-100 transition-all duration-200 group text-left"
                    >
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover:text-primary transition-colors">
                            <span className="material-icons-round text-xl">
                                {item.icon}
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-600 group-hover:text-primary transition-colors">
                            {item.label}
                        </span>
                    </a>
                ))}
            </div>
        </div>
    );
}
