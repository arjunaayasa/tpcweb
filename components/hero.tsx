'use client';

import { useEffect, useState } from 'react';
import { MessageChatSquare, BookOpen01, Send01 } from '@untitledui/icons';
import type { SiteSettings } from '@/lib/site-settings';
import ParticlesBg from './particles-bg';

type HeroProps = {
  settings?: SiteSettings['hero'];
};

export default function Hero({ settings }: HeroProps) {
  const placeholders =
    settings?.placeholders?.length ? settings.placeholders : [
      'Tanya tentang batas waktu pelaporan SPT?',
      'Bagaimana cara menghitung PPh 21 karyawan?',
      'Apa saja syarat pengkreditan PPN masukan?',
      'Kapan wajib lapor pajak tahunan perusahaan?',
      'Bagaimana perlakuan pajak untuk transaksi ekspor?',
      'Bolehkan biaya ini dibebankan dalam laporan pajak?',
    ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 2600);

    return () => clearInterval(interval);
  }, [placeholders.length]);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-soft-bg to-neutral-light overflow-hidden">
      <ParticlesBg />
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-text-dark mb-6 animate-fade-up">
          {settings?.title ?? 'Intelligent Tax Solutions'}
        </h1>
        <p
          className="text-xl md:text-2xl text-secondary mb-10 animate-fade-up"
          style={{ animationDelay: '120ms' }}
        >
          {settings?.subtitle ?? 'Powered by TPC AI. Experience the future of consulting.'}
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
          style={{ animationDelay: '240ms' }}
        >
          <button className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-xl hover:bg-secondary transition-all shadow-lg hover:shadow-xl hover:scale-105 font-bold text-lg min-w-[200px] justify-center">
            <MessageChatSquare className="w-6 h-6" />
            {settings?.ctaPrimary ?? 'Owlie Chat'}
          </button>

          <button className="flex items-center gap-3 bg-transparent text-primary border border-primary px-8 py-4 rounded-xl hover:bg-primary hover:text-white transition-all shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm font-semibold text-lg min-w-[200px] justify-center">
            <BookOpen01 className="w-6 h-6" />
            {settings?.ctaSecondary ?? 'Tax Knowledge AI'}
          </button>
        </div>

        <div
          className="mt-10 w-full max-w-4xl mx-auto animate-fade-up"
          style={{ animationDelay: '360ms' }}
        >
          <div className="relative flex flex-col sm:flex-row items-stretch gap-3 rounded-2xl bg-white/95 backdrop-blur-sm border border-primary/30 px-6 py-6 shadow-lg">
            <label className="sr-only" htmlFor="hero-chat-input">
              Pertanyaan pajak
            </label>
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 relative">
                {inputValue.length === 0 ? (
                  <span
                    key={placeholderIndex}
                    className="absolute left-0 top-0 text-sm text-text-dark/50 animate-fade-up"
                  >
                    {placeholders[placeholderIndex]}
                  </span>
                ) : null}
                <textarea
                  id="hero-chat-input"
                  placeholder=""
                  rows={3}
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  className="w-full bg-transparent text-text-dark placeholder:text-text-dark/50 focus:outline-none resize-none text-left align-top pt-0"
                />
              </div>
            </div>
            <button
              type="button"
              className="absolute right-5 bottom-5 h-11 w-11 rounded-full border border-primary/40 bg-primary text-white hover:bg-secondary hover:border-secondary transition-colors inline-flex items-center justify-center"
              aria-label="Kirim"
            >
              <Send01 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-neutral-light pointer-events-none z-10" />
    </section>
  );
}
