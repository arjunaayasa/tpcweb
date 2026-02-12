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

<<<<<<< HEAD
export default function Hero({ settings, redirects }: HeroProps) {
  const placeholders =
=======
type HeroMode = 'chat' | 'search';

export default function Hero({ settings }: HeroProps) {
  const chatPlaceholders =
>>>>>>> 100e1db3b81738461e957aa0de35dfc626952a67
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

<<<<<<< HEAD
  const owlieChatUrl = redirects?.owlieChat || '#';
  const taxKnowledgeUrl = redirects?.taxKnowledge || '#';
=======
  const currentPlaceholders = mode === 'chat' ? chatPlaceholders : searchPlaceholders;
>>>>>>> 100e1db3b81738461e957aa0de35dfc626952a67

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % currentPlaceholders.length);
    }, 2600);

    return () => clearInterval(interval);
  }, [currentPlaceholders.length]); // Reset interval when placeholders change (mode change)

  // Reset input and placeholder index when mode changes
  useEffect(() => {
    setInputValue('');
    setPlaceholderIndex(0);
  }, [mode]);

  const handleChatSubmit = () => {
    if (!owlieChatUrl || owlieChatUrl === '#') return;
    const query = inputValue.trim();
    // Build URL with optional query param
    const url = query
      ? `${owlieChatUrl}${owlieChatUrl.includes('?') ? '&' : '?'}q=${encodeURIComponent(query)}`
      : owlieChatUrl;
    window.open(url, '_blank', 'noopener');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-soft-bg to-neutral-light overflow-hidden">
      <ParticlesBg />
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold font-playfair text-text-dark mb-6 animate-fade-up">
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
<<<<<<< HEAD
          <a
            href={owlieChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-xl hover:bg-secondary transition-all shadow-lg hover:shadow-xl hover:scale-105 font-bold text-lg min-w-[200px] justify-center"
=======
          <button
            onClick={() => setMode('chat')}
            className={clsx(
              "flex items-center gap-3 px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 font-bold text-lg min-w-[200px] justify-center",
              mode === 'chat'
                ? "bg-primary text-white hover:bg-secondary"
                : "bg-transparent text-primary border border-primary hover:bg-primary hover:text-white backdrop-blur-sm"
            )}
>>>>>>> 100e1db3b81738461e957aa0de35dfc626952a67
          >
            <MessageChatSquare className="w-6 h-6" />
            {settings?.ctaPrimary ?? 'Owlie Chat'}
          </a>

<<<<<<< HEAD
          <a
            href={taxKnowledgeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-transparent text-primary border border-primary px-8 py-4 rounded-xl hover:bg-primary hover:text-white transition-all shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm font-semibold text-lg min-w-[200px] justify-center"
=======
          <button
            onClick={() => setMode('search')}
            className={clsx(
              "flex items-center gap-3 px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 font-bold text-lg min-w-[200px] justify-center",
              mode === 'search'
                ? "bg-secondary text-white"
                : "bg-transparent text-secondary border border-secondary hover:bg-secondary hover:text-white backdrop-blur-sm"
            )}
>>>>>>> 100e1db3b81738461e957aa0de35dfc626952a67
          >
            <BookOpen01 className="w-6 h-6" />
            {settings?.ctaSecondary ?? 'Tax Knowledge AI'}
          </a>
        </div>

        <div
          className="mt-10 w-full max-w-4xl mx-auto animate-fade-up"
          style={{ animationDelay: '360ms' }}
        >
          <motion.div
            layout
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className={clsx(
              "relative flex flex-col sm:flex-row items-stretch gap-3 rounded-2xl bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden border",
              mode === 'chat'
                ? "px-6 py-6 border-primary/30"
                : "px-4 py-3 items-center border-secondary/30 ring-1 ring-secondary/20"
            )}
          >
            <label className="sr-only" htmlFor="hero-input">
              {mode === 'chat' ? 'Pertanyaan pajak' : 'Cari dokumen'}
            </label>
<<<<<<< HEAD
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
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-text-dark placeholder:text-text-dark/50 focus:outline-none resize-none text-left align-top pt-0"
                />
=======
            <div className="flex-1 flex items-center gap-3 min-h-[50px]">
              <div className="flex-1 relative text-left">
                <AnimatePresence mode="wait">
                  {inputValue.length === 0 ? (
                    <motion.span
                      key={mode + placeholderIndex} // key changes force re-render animation
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 top-0 text-sm text-text-dark/50 pointer-events-none truncate w-full text-left"
                    >
                      {currentPlaceholders[placeholderIndex]}
                    </motion.span>
                  ) : null}
                </AnimatePresence>

                {mode === 'chat' ? (
                  <textarea
                    id="hero-input"
                    rows={3}
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    className="w-full bg-transparent text-text-dark placeholder:text-text-dark/50 focus:outline-none resize-none text-left align-top pt-0"
                  />
                ) : (
                  <input
                    id="hero-input"
                    type="text"
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    className="w-full bg-transparent text-text-dark placeholder:text-text-dark/50 focus:outline-none h-full"
                  />
                )}
>>>>>>> 100e1db3b81738461e957aa0de35dfc626952a67
              </div>
            </div>
            <motion.button
              layout
              type="button"
<<<<<<< HEAD
              onClick={handleChatSubmit}
              className="absolute right-5 bottom-5 h-11 w-11 rounded-full border border-primary/40 bg-primary text-white hover:bg-secondary hover:border-secondary transition-colors inline-flex items-center justify-center"
              aria-label="Kirim"
=======
              className={clsx(
                "h-11 w-11 rounded-full border transition-colors inline-flex items-center justify-center flex-shrink-0",
                mode === 'chat'
                  ? "border-primary/40 bg-primary text-white hover:bg-secondary hover:border-secondary"
                  : "self-center border-secondary/40 bg-secondary text-white hover:bg-secondary/80 hover:border-secondary"
              )}
              aria-label={mode === 'chat' ? "Kirim" : "Cari"}
>>>>>>> 100e1db3b81738461e957aa0de35dfc626952a67
            >
              {mode === 'chat' ? <Send01 className="h-4 w-4" /> : <SearchMd className="h-4 w-4" />}
            </motion.button>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-neutral-light pointer-events-none z-10" />
    </section>
  );
}
