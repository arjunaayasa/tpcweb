'use client';

import Link from 'next/link';
import { useSsoToken, appendSsoToken } from '@/lib/use-sso-token';

const TPCAI_URL = process.env.NEXT_PUBLIC_TPCAI_URL || 'http://192.168.0.46:3000';

export default function QuickAccess() {
    const ssoToken = useSsoToken();

    const links = [
        {
            label: 'Tax Knowledge',
            path: '/search',
            icon: 'library_books',
            external: true,
        },
        {
            label: 'Owlie Chat',
            path: '/chat',
            icon: 'chat',
            external: true,
        },
        {
            label: 'Kelola Langganan',
            path: '/my-profile/subscriptions',
            icon: 'credit_card',
            external: false,
        },
    ];

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 transition-all duration-300">
            <div className="flex items-center gap-2 mb-6 text-primary">
                <span className="material-icons-round text-xl">link</span>
                <h3 className="text-lg font-bold text-gray-900">Akses Cepat</h3>
            </div>
            <div className="space-y-1">
                {links.map((link) =>
                    link.external ? (
                        <a
                            key={link.path}
                            href={appendSsoToken(`${TPCAI_URL}${link.path}`, ssoToken)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors">
                                {link.label}
                            </span>
                            <span className="material-icons-round text-gray-300 group-hover:text-primary text-lg transition-colors">
                                open_in_new
                            </span>
                        </a>
                    ) : (
                        <Link
                            key={link.path}
                            href={link.path}
                            className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors">
                                {link.label}
                            </span>
                            <span className="material-icons-round text-gray-300 group-hover:text-primary text-lg transition-colors">
                                arrow_forward
                            </span>
                        </Link>
                    )
                )}
            </div>
        </div>
    );
}
