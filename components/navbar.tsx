'use client';

import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const linkHover = isScrolled ? 'hover:text-accent-warm' : 'hover:text-secondary';
  const loginClasses = isScrolled
    ? 'text-white border-white/40 hover:bg-white/10'
    : 'text-text-dark border-text-dark/30 hover:bg-text-dark/5';

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-colors duration-300 animate-fade-down ${
        isScrolled ? 'bg-primary text-white shadow-lg' : 'bg-transparent text-text-dark'
      }`}
    >
      <div className="relative container mx-auto px-6 py-4 flex items-center">
        <div className="text-xl font-bold tracking-tight">
          Taxindo Prime Consulting
        </div>

        <div className="hidden md:flex gap-8 absolute left-1/2 -translate-x-1/2">
          <a href="#home" className={`cursor-pointer transition-colors ${linkHover}`}>Home</a>
          <a href="#features" className={`cursor-pointer transition-colors ${linkHover}`}>Features</a>
          <a href="#products" className={`cursor-pointer transition-colors ${linkHover}`}>Products</a>
          <a href="#testimonials" className={`cursor-pointer transition-colors ${linkHover}`}>Testimonials</a>
          <a href="#faq" className={`cursor-pointer transition-colors ${linkHover}`}>FAQ</a>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button className="rounded-full bg-primary text-white px-5 py-2 text-sm font-semibold shadow-sm transition-colors hover:bg-secondary">
            Coba Gratis
          </button>
          <button
            className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${loginClasses}`}
          >
            Login
          </button>
        </div>
      </div>
    </nav>
  );
}
