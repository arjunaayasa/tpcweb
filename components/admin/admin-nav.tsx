'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    label: 'Dasbor',
    href: '/admin-tpc',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 3h7v7H3z" />
        <path d="M14 3h7v4h-7z" />
        <path d="M14 10h7v11h-7z" />
        <path d="M3 12h7v9H3z" />
      </svg>
    ),
  },
  {
    label: 'Pengguna',
    href: '/admin-tpc/users',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 13a4 4 0 1 0-0.01 0z" />
        <path d="M4 20c1.6-3 4.6-5 8-5s6.4 2 8 5" />
      </svg>
    ),
  },
  {
    label: 'Langganan',
    href: '/admin-tpc/subscriptions',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    label: 'Koleksi Dokumen',
    href: '/admin-tpc/collections',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    label: 'AI Add-on',
    href: '/admin-tpc/ai-addon-models',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    label: 'Harga AI Add-on',
    href: '/admin-tpc/ai-addon-prices',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    label: 'Testimonial',
    href: '/admin-tpc/testimonials',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 6h16v10H7l-3 3V6z" />
      </svg>
    ),
  },
  {
    label: 'Pengaturan',
    href: '/admin-tpc/settings',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v3M12 18v3M4.9 4.9l2.1 2.1M16.9 16.9l2.1 2.1M3 12h3M18 12h3M4.9 19.1l2.1-2.1M16.9 7.1l2.1-2.1" />
      </svg>
    ),
  },
  {
    label: 'Invoice',
    href: '/admin-tpc/settings/invoice',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 2h9l5 5v15H6z" />
        <path d="M15 2v5h5" />
        <path d="M10 12h4M10 16h4" />
      </svg>
    ),
  },
  {
    label: 'Midtrans',
    href: '/admin-tpc/settings/midtrans',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 15h4" />
      </svg>
    ),
  },
  {
    label: 'Status Sistem',
    href: '/admin-tpc/system',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 12h4l2-4 3 8 2-4h7" />
      </svg>
    ),
  },
];

type AdminNavProps = {
  collapsed?: boolean;
};

export default function AdminNav({ collapsed }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-2xl px-3 py-3 text-sm transition-colors ${isActive
                ? 'bg-white/20 text-white shadow-lg border border-white/20'
                : 'text-white/70 hover:text-white hover:bg-white/10'
              } ${collapsed ? 'flex items-center justify-center' : 'flex items-center justify-between gap-3'}`}
          >
            {collapsed ? <span className="sr-only">{item.label}</span> : <span>{item.label}</span>}
            <span className="text-white/80">{item.icon}</span>
          </Link>
        );
      })}
    </nav>
  );
}
