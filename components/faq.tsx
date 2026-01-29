'use client';

import { useState } from 'react';
import { ChevronDown } from '@untitledui/icons';
import type { SiteSettings } from '@/lib/site-settings';

const defaultFaqs = [
  {
    question: 'Apakah Owlie Chat dapat digunakan untuk konsultasi pajak harian?',
    answer:
      'Ya. Owlie Chat membantu menjawab pertanyaan pajak harian dengan cepat, termasuk ringkasan pasal dan rekomendasi awal.',
  },
  {
    question: 'Seberapa lengkap Tax Knowledge AI?',
    answer:
      'Tax Knowledge AI dirancang untuk mempermudah akses referensi pajak yang terstruktur dan relevan untuk kebutuhan tim.',
  },
  {
    question: 'Bagaimana Studio AI membantu tim saya?',
    answer:
      'Studio AI mempercepat pembuatan draft dokumen pajak, memo, dan ringkasan sehingga tim bisa fokus pada review strategis.',
  },
  {
    question: 'Apakah data saya aman?',
    answer:
      'TPC AI menerapkan kontrol keamanan berlapis untuk melindungi data dan memastikan akses hanya pada tim yang berwenang.',
  },
  {
    question: 'Bisakah saya mencoba dulu sebelum berlangganan?',
    answer:
      'Tentu. Klik tombol Coba Gratis di bagian atas untuk mulai mencoba fitur-fitur inti TPC AI.',
  },
];

type FaqProps = {
  settings?: SiteSettings['faq'];
};

export default function Faq({ settings }: FaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = settings?.items?.length ? settings.items : defaultFaqs;
  const side = settings?.side;

  return (
    <section id="faq" className="py-20 bg-gradient-to-b from-neutral-light to-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
          <div className="space-y-6">
            <div className="animate-fade-up">
              <h2 className="text-4xl md:text-5xl font-bold text-text-dark">
                {settings?.title ?? 'Tanya Jawab'}
              </h2>
              <p className="text-lg text-text-dark/70 mt-4">
                {settings?.subtitle ?? 'Jawaban cepat untuk pertanyaan yang paling sering ditanyakan.'}
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={item.question}
                    className="rounded-2xl bg-white border border-white/70 shadow-sm px-6 py-5 animate-fade-up"
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenIndex(isOpen ? null : index)
                      }
                      className="w-full flex items-center justify-between gap-4 text-left"
                    >
                      <span className="text-lg font-semibold text-text-dark">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 text-text-dark transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-[max-height] duration-300 ${
                        isOpen ? 'max-h-40' : 'max-h-0'
                      } ${isOpen ? 'animate-accordion-down' : 'animate-accordion-up'}`}
                    >
                      <p className="text-text-dark/70 mt-3 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:pl-6 animate-fade-up" style={{ animationDelay: '140ms' }}>
            <p className="text-sm uppercase tracking-[0.3em] text-secondary">
              {side?.kicker ?? 'Panduan Singkat'}
            </p>
            <h3 className="text-3xl md:text-4xl font-bold text-text-dark mt-4">
              {side?.title ?? 'Berikut ini adalah ringkasan singkat seputar layanan TPC AI.'}
            </h3>
            <p className="text-lg text-text-dark/70 mt-4 leading-relaxed">
              {side?.body ?? 'Gunakan Tanya Jawab ini untuk memahami cara kerja Owlie Chat, Tax Knowledge AI, hingga Studio AI. Jika masih ada pertanyaan, tim kami siap membantu Anda.'}
            </p>
            <div className="mt-6 space-y-3 text-text-dark/70">
              {(side?.bullets?.length ? side.bullets : [
                'Owlie Chat untuk konsultasi pajak instan.',
                'Tax Knowledge AI untuk riset regulasi.',
                'Studio AI untuk draft dokumen pajak.',
              ]).map((item) => (
                <p key={item}>- {item}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
