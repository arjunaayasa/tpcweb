import Link from 'next/link';

export default function QuickAccess() {
    const links = [
        {
            label: 'Tax Knowledge',
            href: '/tax-knowledge', // Assuming this path exists or will exist
            icon: 'library_books',
        },
        {
            label: 'Owlie Chat',
            href: '/chat',
            icon: 'chat',
        },
        {
            label: 'Kelola Langganan',
            href: '/my-profile/subscriptions',
            icon: 'credit_card',
        },
    ];

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 transition-all duration-300">
            <div className="flex items-center gap-2 mb-6 text-primary">
                <span className="material-icons-round text-xl">link</span>
                <h3 className="text-lg font-bold text-gray-900">Akses Cepat</h3>
            </div>
            <div className="space-y-1">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors">
                            {link.label}
                        </span>
                        <span className="material-icons-round text-gray-300 group-hover:text-primary text-lg transition-colors">
                            arrow_forward
                        </span>
                    </Link>
                ))}
            </div>
        </div>

    );
}
