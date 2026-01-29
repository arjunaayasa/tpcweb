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
            className={`rounded-2xl px-3 py-3 text-sm transition-colors ${
              isActive
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
