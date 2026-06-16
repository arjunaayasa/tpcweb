'use client';

import { useState } from 'react';
import OrgNav from '@/components/org/org-nav';

type OrgShellProps = {
  orgName: string;
  orgSlug: string;
  children: React.ReactNode;
};

export default function OrgShell({ orgName, orgSlug, children }: OrgShellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-neutral-light text-text-dark flex">
      {isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          aria-label="Tutup menu"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20' : 'md:w-72'} bg-[linear-gradient(180deg,#0f4c81,#0b355c)] text-white shadow-xl`}
      >
        <div className={`flex h-full flex-col ${isCollapsed ? 'px-3 py-6' : 'px-6 py-8'}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-3'}`}>
            <div className={`${isCollapsed ? 'text-center' : 'space-y-1'}`}>
              <p className={`text-xs uppercase tracking-[0.3em] text-white/70 ${isCollapsed ? 'hidden' : ''}`}>
                Konsol Organisasi
              </p>
              <h1 className={`font-semibold ${isCollapsed ? 'text-base' : 'text-xl'}`}>
                {isCollapsed ? orgName.slice(0, 3).toUpperCase() : orgName}
              </h1>
              {!isCollapsed ? (
                <p className="text-xs text-white/60">{orgSlug}.taxindo.ai</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 hover:border-white"
              aria-label={isCollapsed ? 'Perluas sidebar' : 'Perkecil sidebar'}
            >
              <svg
                viewBox="0 0 24 24"
                className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
          </div>

          <div className={`mt-8 flex-1 ${isCollapsed ? '' : 'pr-1'} overflow-y-auto`}>
            <OrgNav collapsed={isCollapsed} />
          </div>

          <div className={`mt-6 rounded-2xl border border-white/15 bg-white/10 p-4 text-xs text-white/70 ${isCollapsed ? 'hidden' : ''}`}>
            Kelola anggota, kuota, dan kursi organisasi Anda dari panel ini.
          </div>

          <a
            href="/my-profile"
            className={`mt-auto flex items-center justify-center gap-2 rounded-2xl border border-white/30 px-4 py-3 text-sm text-white/80 hover:border-white hover:text-white ${
              isCollapsed ? 'px-0' : ''
            }`}
          >
            {isCollapsed ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 6l-6 6 6 6" />
                <path d="M3 12h12" />
              </svg>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 6l-6 6 6 6" />
                  <path d="M3 12h12" />
                </svg>
                <span>Ke Profil Saya</span>
              </>
            )}
          </a>
        </div>
      </aside>

      <div className="flex-1 bg-white h-screen overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between border-b border-primary/10 bg-white px-6 py-4 md:hidden">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-text-dark/60">Konsol Organisasi</p>
            <h1 className="text-lg font-semibold text-text-dark">{orgName}</h1>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-xl border border-primary/20 px-3 py-2 text-sm text-text-dark"
          >
            Menu
          </button>
        </div>
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        <footer className="border-t border-primary/10 bg-white px-4 py-4 text-xs text-text-dark/60 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>Taxindo Prime Consulting — Konsol Organisasi</span>
            <span>© 2026 TPC AI</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
