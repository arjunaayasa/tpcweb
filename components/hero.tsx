'use client';

import { useEffect, useState } from 'react';
import { MessageChatSquare, BookOpen01, Send01, SearchMd } from '@untitledui/icons';
import type { SiteSettings } from '@/lib/site-settings';
import ParticlesBg from './particles-bg';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';


type HeroProps = {
  settings?: SiteSettings['hero'];
  redirects?: SiteSettings['redirects'];
};

type HeroMode = 'chat' | 'search';

export default function Hero({ settings, redirects }: HeroProps) {
  const chatPlaceholders =
    settings?.placeholders?.length ? settings.placeholders : [
      'Tanya tentang batas waktu pelaporan SPT?',
      'Bagaimana cara menghitung PPh 21 karyawan?',
      'Apa saja syarat pengkreditan PPN masukan?',
      'Kapan wajib lapor pajak tahunan perusahaan?',
      'Bagaimana perlakuan pajak untuk transaksi ekspor?',
      'Bolehkan biaya ini dibebankan dalam laporan pajak?',
    ];

  const searchPlaceholders = [
    'Cari UU PPh terbaru...',
    'Peraturan Menteri Keuangan tentang PPN...',
    'Surat Edaran Dirjen Pajak...',
    'Putusan Pengadilan Pajak...',
  ];

  const [mode, setMode] = useState<HeroMode>('chat');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const owlieChatUrl = redirects?.owlieChat || '#';
  const taxKnowledgeUrl = redirects?.taxKnowledge || '#';

  const currentPlaceholders = mode === 'chat' ? chatPlaceholders : searchPlaceholders;

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % currentPlaceholders.length);
    }, 2600);

    return () => clearInterval(interval);
  }, [currentPlaceholders.length]);

  // Reset input and placeholder index when mode changes
  useEffect(() => {
    setInputValue('');
    setPlaceholderIndex(0);
  }, [mode]);

  const handleSubmit = () => {
    const query = inputValue.trim();
    if (mode === 'chat') {
      if (!owlieChatUrl || owlieChatUrl === '#') return;
      const url = query
        ? `${owlieChatUrl}${owlieChatUrl.includes('?') ? '&' : '?'}q=${encodeURIComponent(query)}`
        : owlieChatUrl;
      window.open(url, '_blank', 'noopener');
    } else {
      if (!taxKnowledgeUrl || taxKnowledgeUrl === '#') return;
      const base = taxKnowledgeUrl.replace(/\/+$/, '');
      const url = query
        ? `${base}/search?q=${encodeURIComponent(query)}`
        : taxKnowledgeUrl;
      window.open(url, '_blank', 'noopener');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-soft-bg to-neutral-light overflow-hidden">
      <ParticlesBg />
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold font-playfair text-text-dark mb-3 sm:mb-6 animate-fade-up">
          {settings?.title ?? 'Intelligent Tax Solutions'}
        </h1>
        <p
          className="text-base sm:text-xl md:text-2xl text-secondary mb-5 sm:mb-10 animate-fade-up"
          style={{ animationDelay: '120ms' }}
        >
          {settings?.subtitle ?? 'Powered by TPC AI. Experience the future of consulting.'}
        </p>

        <div
          className="flex flex-row items-center justify-center gap-2 sm:gap-4 animate-fade-up"
          style={{ animationDelay: '240ms' }}
        >
          <button
            onClick={() => setMode('chat')}
            className={clsx(
              "flex items-center gap-2 px-4 sm:px-8 py-2.5 sm:py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 font-bold text-sm sm:text-lg flex-1 sm:flex-none sm:min-w-[200px] justify-center",
              mode === 'chat'
                ? "bg-primary text-white hover:bg-secondary"
                : "bg-transparent text-primary border border-primary hover:bg-primary hover:text-white backdrop-blur-sm"
            )}
          >
            <MessageChatSquare className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" />
            <span className="truncate">{settings?.ctaPrimary ?? 'Owlie Chat'}</span>
          </button>

          <button
            onClick={() => setMode('search')}
            className={clsx(
              "flex items-center gap-2 px-4 sm:px-8 py-2.5 sm:py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 font-bold text-sm sm:text-lg flex-1 sm:flex-none sm:min-w-[200px] justify-center",
              mode === 'search'
                ? "bg-secondary text-white"
                : "bg-transparent text-secondary border border-secondary hover:bg-secondary hover:text-white backdrop-blur-sm"
            )}
          >
            <BookOpen01 className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" />
            <span className="truncate">{settings?.ctaSecondary ?? 'Tax Knowledge AI'}</span>
          </button>
        </div>

        <div
          className="mt-4 sm:mt-10 w-full max-w-4xl mx-auto animate-fade-up"
          style={{ animationDelay: '360ms' }}
        >
          <motion.div
            layout
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className={clsx(
              "relative flex items-stretch gap-2 sm:gap-3 rounded-2xl bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden border",
              mode === 'chat'
                ? "flex-col sm:flex-row px-4 py-4 sm:px-6 sm:py-6 border-primary/30"
                : "flex-row px-3 py-2.5 sm:px-4 sm:py-3 items-center border-secondary/30 ring-1 ring-secondary/20"
            )}
          >
            <label className="sr-only" htmlFor="hero-input">
              {mode === 'chat' ? 'Pertanyaan pajak' : 'Cari dokumen'}
            </label>
            <div className="flex-1 flex items-center gap-3 min-h-[36px] sm:min-h-[50px]">
              <div className="flex-1 relative text-left">
                <AnimatePresence mode="wait">
                  {inputValue.length === 0 ? (
                    <motion.span
                      key={mode + placeholderIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 top-0 text-xs sm:text-sm text-text-dark/50 pointer-events-none truncate w-full text-left"
                    >
                      {currentPlaceholders[placeholderIndex]}
                    </motion.span>
                  ) : null}
                </AnimatePresence>

                {mode === 'chat' ? (
                  <textarea
                    id="hero-input"
                    rows={2}
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-text-dark placeholder:text-text-dark/50 focus:outline-none resize-none text-left align-top pt-0 text-sm sm:text-base"
                  />
                ) : (
                  <input
                    id="hero-input"
                    type="text"
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-text-dark placeholder:text-text-dark/50 focus:outline-none h-full text-sm sm:text-base"
                  />
                )}
              </div>
            </div>
            <motion.button
              layout
              type="button"
              onClick={handleSubmit}
              className={clsx(
                "h-9 w-9 sm:h-11 sm:w-11 rounded-full border transition-colors inline-flex items-center justify-center flex-shrink-0",
                mode === 'chat'
                  ? "border-primary/40 bg-primary text-white hover:bg-secondary hover:border-secondary self-end sm:self-auto"
                  : "self-center border-secondary/40 bg-secondary text-white hover:bg-secondary/80 hover:border-secondary"
              )}
              aria-label={mode === 'chat' ? "Kirim" : "Cari"}
            >
              {mode === 'chat' ? <Send01 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <SearchMd className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            </motion.button>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-neutral-light pointer-events-none z-10" />
    </section>
  );
}
