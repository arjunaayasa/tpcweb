'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

type NavbarUser = {
  name?: string | null;
  email: string;
  role?: 'ADMIN' | 'USER';
};

type NavbarRedirects = {
  owlieChat: string;
  taxKnowledge: string;
};

type NavbarClientProps = {
  user: NavbarUser | null;
  redirects?: NavbarRedirects;
};

const getInitials = (user: NavbarUser) => {
  const source = user.name?.trim() || user.email;
  const parts = source.split(' ').filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
};

export default function NavbarClient({ user, redirects }: NavbarClientProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFiturOpen, setIsFiturOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const fiturRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isOpen && !isFiturOpen) return undefined;

    const handlePointer = (event: MouseEvent) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (isFiturOpen && fiturRef.current && !fiturRef.current.contains(event.target as Node)) {
        setIsFiturOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointer);
    return () => window.removeEventListener('pointerdown', handlePointer);
  }, [isOpen, isFiturOpen]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    setIsOpen(false);
    router.replace('/login');
    router.refresh();
  };

  const profileLabel = useMemo(() => {
    if (!user) return '';
    return user.name?.trim() || user.email;
  }, [user]);

  const linkHover = isScrolled ? 'hover:text-accent-warm' : 'hover:text-secondary';
  const trialClasses = isScrolled
    ? 'bg-accent-warm text-text-dark border-accent-warm/70 hover:bg-accent-warm/90'
    : 'bg-primary text-white border-primary/40 hover:bg-secondary hover:border-secondary';
  const loginClasses = isScrolled
    ? 'text-white border-white/40 hover:bg-white/10'
    : 'text-text-dark border-text-dark/30 hover:bg-text-dark/5';

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-colors duration-300 animate-fade-down ${isScrolled ? 'bg-primary text-white shadow-lg' : 'bg-transparent text-text-dark'
        }`}
    >
      <div className="relative container mx-auto px-6 py-4 flex items-center">
        <div className="text-xl font-bold tracking-tight">
          Taxindo Prime Consulting
        </div>

        <div className="hidden md:flex gap-8 absolute left-1/2 -translate-x-1/2">
          <a href="/#home" className={`cursor-pointer transition-colors ${linkHover}`}>Beranda</a>

          {/* Fitur Dropdown */}
          <div className="relative" ref={fiturRef}>
            <button
              type="button"
              onClick={() => setIsFiturOpen((p) => !p)}
              className={`cursor-pointer transition-colors inline-flex items-center gap-1 ${linkHover}`}
            >
              Fitur
              <svg
                className={`h-3.5 w-3.5 transition-transform ${isFiturOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isFiturOpen ? (
              <div
                className={`absolute left-1/2 -translate-x-1/2 mt-3 w-56 rounded-2xl border shadow-xl overflow-hidden ${isScrolled
                    ? 'border-white/10 bg-primary text-white'
                    : 'border-slate-200 bg-white text-text-dark'
                  }`}
              >
                <div className="flex flex-col py-2">
                  <a
                    href={redirects?.owlieChat || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsFiturOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${isScrolled ? 'hover:bg-white/10' : 'hover:bg-slate-50'
                      }`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <path d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-semibold text-sm">Owlie Chat</p>
                      <p className={`text-[11px] ${isScrolled ? 'text-white/60' : 'text-text-dark/50'}`}>
                        Chat pajak AI instan
                      </p>
                    </div>
                  </a>
                  <a
                    href={redirects?.taxKnowledge || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsFiturOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${isScrolled ? 'hover:bg-white/10' : 'hover:bg-slate-50'
                      }`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-secondary" fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-semibold text-sm">Tax Knowledge AI</p>
                      <p className={`text-[11px] ${isScrolled ? 'text-white/60' : 'text-text-dark/50'}`}>
                        Basis pengetahuan pajak
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            ) : null}
          </div>

          <a href="/#products" className={`cursor-pointer transition-colors ${linkHover}`}>Produk</a>
          <a href="/#testimonials" className={`cursor-pointer transition-colors ${linkHover}`}>Testimoni</a>
          <a href="/#pricing" className={`cursor-pointer transition-colors ${linkHover}`}>Harga</a>
          <a href="/#faq" className={`cursor-pointer transition-colors ${linkHover}`}>Tanya Jawab</a>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`flex items-center gap-3 rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${isScrolled ? 'border-white/40 hover:bg-white/10' : 'border-text-dark/20 hover:bg-text-dark/5'
                  }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/20 text-xs font-bold text-secondary">
                  {getInitials(user)}
                </span>
                <span className="hidden md:flex flex-col items-start text-xs">
                  <span className="font-semibold">{profileLabel}</span>
                  <span className={isScrolled ? 'text-white/70' : 'text-text-dark/60'}>
                    {user.role === 'ADMIN' ? 'Admin' : 'Pengguna'}
                  </span>
                </span>
              </button>
              {isOpen ? (
                <div
                  className={`absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border shadow-xl ${isScrolled ? 'border-white/10 bg-primary text-white' : 'border-slate-200 bg-white text-text-dark'
                    }`}
                >
                  <div className="px-4 py-3 text-xs">
                    <p className="font-semibold">{profileLabel}</p>
                    <p className={isScrolled ? 'text-white/70' : 'text-text-dark/60'}>{user.email}</p>
                  </div>
                  <div className="flex flex-col gap-1 px-2 py-2 text-sm">
                    <Link
                      href="/my-profile"
                      className={`rounded-xl px-3 py-2 transition-colors ${isScrolled ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                        }`}
                      onClick={() => setIsOpen(false)}
                    >
                      Portal Pengguna
                    </Link>
                    <Link
                      href="/my-profile/subscriptions"
                      className={`rounded-xl px-3 py-2 transition-colors ${isScrolled ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                        }`}
                      onClick={() => setIsOpen(false)}
                    >
                      Kelola Langganan
                    </Link>
                    {user.role === 'ADMIN' ? (
                      <Link
                        href="/admin-tpc"
                        className={`rounded-xl px-3 py-2 transition-colors ${isScrolled ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                          }`}
                        onClick={() => setIsOpen(false)}
                      >
                        Panel Admin
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className={`rounded-xl px-3 py-2 text-left transition-colors ${isScrolled ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                        }`}
                    >
                      Keluar
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={`rounded-full border px-5 py-2 text-sm font-semibold shadow-sm transition-colors animate-pulse-ring ${trialClasses}`}
              >
                Coba Gratis
              </Link>
              <Link
                href="/login"
                className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${loginClasses}`}
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
