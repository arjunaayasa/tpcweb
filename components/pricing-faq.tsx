'use client';

import { useState } from 'react';

const faqs = [
    {
        q: 'Apakah saya bisa mencoba gratis?',
        a: 'Ya! Paket Gratis memberikan akses ke Owlie Lite dengan 20 kuota harian tanpa batas waktu. Anda bisa langsung mulai tanpa kartu kredit.',
    },
    {
        q: 'Apa perbedaan utama antar paket?',
        a: 'Setiap paket membuka model AI yang berbeda. Paket Gratis hanya mengakses Owlie Lite. Paket Dasar dan Plus membuka Owlie Chat dan Owlie Thinking dengan kuota yang berbeda. Paket Maks memberikan akses ke semua model termasuk Owlie Max tanpa batas kuota.',
    },
    {
        q: 'Bagaimana cara upgrade atau downgrade paket?',
        a: 'Anda bisa mengubah paket kapan saja melalui halaman Kelola Langganan di portal pengguna, atau hubungi tim billing kami untuk bantuan langsung.',
    },
    {
        q: 'Apakah ada diskon untuk pembayaran tahunan?',
        a: 'Ya, pembayaran tahunan mendapatkan diskon signifikan dibanding pembayaran bulanan. Anda bisa melihat perbandingan harga dengan mengklik toggle Bulanan/Tahunan di atas.',
    },
    {
        q: 'Model AI apa saja yang tersedia?',
        a: 'Kami menyediakan 4 model: Owlie Lite (cepat dan ringan), Owlie Chat v1.5 (percakapan mendalam), Owlie Thinking v1.5 (analisis kompleks), dan Owlie Max v1.5 (model paling canggih). Akses ke model tergantung paket yang dipilih.',
    },
    {
        q: 'Apakah kuota direset setiap hari?',
        a: 'Ya, kuota penggunaan harian akan direset setiap pukul 00:00 WIB. Kuota yang tidak terpakai tidak akan diakumulasikan ke hari berikutnya.',
    },
    {
        q: 'Bagaimana jika kuota harian saya habis?',
        a: 'Jika kuota habis, Anda perlu menunggu hingga hari berikutnya atau upgrade ke paket yang lebih tinggi untuk mendapatkan kuota lebih besar atau bahkan tanpa batas.',
    },
    {
        q: 'Apakah data dan percakapan saya aman?',
        a: 'Keamanan data adalah prioritas kami. Semua percakapan dienkripsi dan kami tidak membagikan data Anda kepada pihak ketiga. Anda bisa membaca kebijakan privasi kami untuk detail lebih lanjut.',
    },
];

export default function PricingFaq() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (i: number) => {
        setOpenIndex(openIndex === i ? null : i);
    };

    return (
        <section className="py-20 bg-gradient-to-b from-white to-neutral-light">
            <div className="container mx-auto px-6 max-w-3xl">
                <div className="text-center mb-12">
                    <p className="text-xs uppercase tracking-[0.4em] text-secondary font-semibold mb-3">FAQ</p>
                    <h2 className="text-3xl md:text-4xl font-bold font-playfair text-text-dark mb-4">
                        Pertanyaan Umum Seputar Harga
                    </h2>
                    <p className="text-text-dark/60">
                        Jawaban untuk pertanyaan yang sering ditanyakan tentang paket dan layanan kami.
                    </p>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-primary/10 bg-white shadow-sm overflow-hidden transition-all"
                        >
                            <button
                                type="button"
                                onClick={() => toggle(i)}
                                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left text-sm font-semibold text-text-dark hover:bg-slate-50 transition-colors"
                            >
                                <span>{faq.q}</span>
                                <svg
                                    className={`h-4 w-4 flex-shrink-0 text-text-dark/40 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''
                                        }`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="px-6 pb-4 text-sm text-text-dark/60 leading-relaxed">
                                    {faq.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-text-dark/50 mb-4">Masih ada pertanyaan?</p>
                    <a
                        href="mailto:support@taxindo.ai"
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-secondary hover:shadow-lg hover:shadow-primary/20"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Hubungi Tim Kami
                    </a>
                </div>
            </div>
        </section>
    );
}
