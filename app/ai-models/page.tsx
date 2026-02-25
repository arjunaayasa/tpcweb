import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { getSiteSettings } from '@/lib/site-settings';
import Link from 'next/link';

export const metadata = {
    title: 'Model AI Owlie - TPC AI',
    description: 'Kenali setiap model AI Owlie yang tersedia. Dari Owlie Lite hingga Owlie Max, temukan model yang sesuai kebutuhan perpajakan Anda.',
};

/* ── Icons ── */
const CheckIcon = () => (
    <svg className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const IconLite = () => (
    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const IconChat = () => (
    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
);

const IconThinking = () => (
    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const IconMax = () => (
    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
);

/* ── Model data ── */
const models = [
    {
        id: 'owlie-loc',
        name: 'Owlie Lite',
        tagline: 'Cepat & Ringan',
        description:
            'Model lokal yang ringan dan responsif. Cocok untuk pertanyaan pajak sederhana dan sehari-hari dengan jawaban instan.',
        Icon: IconLite,
        color: 'emerald',
        accentBg: 'bg-emerald-50',
        accentBorder: 'border-emerald-200',
        accentText: 'text-emerald-700',
        accentBadge: 'bg-emerald-100 text-emerald-700',
        iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
        features: [
            'Respons sangat cepat',
            'Cocok untuk pertanyaan umum pajak',
            'Ringkasan pasal & ketentuan',
            'Ideal untuk konsultasi awal',
        ],
        bestFor: 'Pertanyaan pajak sederhana, ringkasan pasal, dan jawaban cepat sehari-hari.',
        addon: 'AI Starter',
    },
    {
        id: 'owlie-chat',
        name: 'Owlie Chat v1.5',
        tagline: 'Percakapan Natural',
        description:
            'Model percakapan canggih yang memahami konteks pajak dengan mendalam. Mampu menguraikan peraturan perpajakan dengan bahasa yang mudah dipahami.',
        Icon: IconChat,
        color: 'blue',
        accentBg: 'bg-blue-50',
        accentBorder: 'border-blue-200',
        accentText: 'text-blue-700',
        accentBadge: 'bg-blue-100 text-blue-700',
        iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
        features: [
            'Konteks percakapan yang kaya',
            'Penjelasan peraturan pajak detail',
            'Parsing dokumen perpajakan',
            'Dukungan multi-bahasa',
        ],
        bestFor: 'Diskusi mendalam tentang peraturan pajak, interpretasi pasal, dan analisis dokumen.',
        addon: 'AI Starter',
    },
    {
        id: 'owlie-thinking',
        name: 'Owlie Thinking v1.5',
        tagline: 'Analisis Mendalam',
        description:
            'Model reasoning canggih yang mampu melakukan analisis mendalam dan penalaran multi-langkah. Dirancang untuk pertanyaan pajak yang kompleks dan membutuhkan pemikiran terstruktur.',
        Icon: IconThinking,
        color: 'violet',
        accentBg: 'bg-violet-50',
        accentBorder: 'border-violet-200',
        accentText: 'text-violet-700',
        accentBadge: 'bg-violet-100 text-violet-700',
        iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
        features: [
            'Penalaran multi-langkah (Chain of Thought)',
            'Analisis kasus pajak kompleks',
            'Perbandingan antar regulasi',
            'Rekomendasi strategis pajak',
        ],
        bestFor: 'Analisis kasus pajak kompleks, perencanaan pajak, dan perbandingan peraturan antar yurisdiksi.',
        addon: 'AI Pro',
    },
    {
        id: 'owlie-max',
        name: 'Owlie Max v1.5',
        tagline: 'Performa Maksimal',
        description:
            'Model paling powerful dengan konteks terbesar dan output terpanjang. Mampu menganalisis dokumen pajak berhalaman-halaman dan menghasilkan laporan analisis komprehensif.',
        Icon: IconMax,
        color: 'amber',
        accentBg: 'bg-amber-50',
        accentBorder: 'border-amber-200',
        accentText: 'text-amber-700',
        accentBadge: 'bg-amber-100 text-amber-700',
        iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
        features: [
            'Konteks terbesar',
            'Output terpanjang',
            'Analisis dokumen utuh',
            'Laporan komprehensif',
        ],
        bestFor: 'Analisis dokumen panjang, laporan pajak komprehensif, dan proyek riset perpajakan besar.',
        addon: 'AI Unlimited',
    },
];

const addonTiers = [
    {
        name: 'AI Starter',
        models: ['Owlie Lite', 'Owlie Chat v1.5'],
        badge: 'bg-emerald-100 text-emerald-700',
    },
    {
        name: 'AI Pro',
        models: ['Owlie Lite', 'Owlie Chat v1.5', 'Owlie Thinking v1.5'],
        badge: 'bg-violet-100 text-violet-700',
    },
    {
        name: 'AI Unlimited',
        models: ['Owlie Lite', 'Owlie Chat v1.5', 'Owlie Thinking v1.5', 'Owlie Max v1.5'],
        badge: 'bg-amber-100 text-amber-700',
    },
];



export default async function AIModelsPage() {
    const settings = await getSiteSettings(['footer']);

    return (
        <main className="min-h-screen flex flex-col bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-gradient-to-b from-neutral-light via-white to-neutral-light overflow-hidden">
                {/* Gradient blobs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full bg-primary/10 blur-[100px]" />
                    <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-[100px]" />
                    <div className="absolute -top-10 right-1/3 w-64 h-64 rounded-full bg-accent-warm/8 blur-[80px]" />
                </div>

                {/* Dot grid pattern */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.35]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px', color: 'var(--color-primary, #0d9488)' }} />

                {/* Decorative geometric shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Top-left ring */}
                    <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full border-2 border-primary/10" />
                    <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full border border-primary/5" />
                    {/* Top-right diamond */}
                    <div className="absolute top-24 right-12 w-16 h-16 rotate-45 rounded-lg border border-secondary/15 bg-secondary/5" />
                    <div className="absolute top-20 right-24 w-8 h-8 rotate-12 rounded-md border border-primary/10 bg-primary/5" />
                    {/* Bottom-left hexagon-ish */}
                    <div className="absolute bottom-16 left-16 w-20 h-20 rotate-12 rounded-2xl border border-primary/10 bg-primary/[0.03]" />
                    {/* Bottom-right ring */}
                    <div className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full border-2 border-secondary/10" />
                    <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full border border-secondary/5" />
                    {/* Floating accent shapes */}
                    <div className="absolute top-1/3 left-8 w-6 h-6 rounded-full bg-primary/10" />
                    <div className="absolute top-1/2 right-16 w-4 h-4 rounded-full bg-accent-warm/15" />
                    <div className="absolute bottom-1/3 left-1/3 w-3 h-3 rounded-full bg-secondary/15" />
                    {/* Wavy line via SVG */}
                    <svg className="absolute bottom-0 left-0 w-full h-16 text-primary/5" viewBox="0 0 1440 64" fill="none" preserveAspectRatio="none">
                        <path d="M0 32C240 0 480 64 720 32C960 0 1200 64 1440 32V64H0Z" fill="currentColor" />
                    </svg>
                </div>

                <div className="relative z-10 container mx-auto px-6 text-center">
                    <p className="text-xs uppercase tracking-[0.5em] text-secondary font-semibold mb-4">
                        AI Models
                    </p>
                    <h1 className="text-4xl md:text-6xl font-bold font-playfair text-text-dark mb-6">
                        Kenali Model AI <span className="text-primary">Owlie</span>
                    </h1>
                    <p className="text-lg md:text-xl text-text-dark/60 max-w-2xl mx-auto leading-relaxed">
                        Dari jawaban cepat hingga analisis mendalam — pilih model yang paling sesuai dengan kebutuhan perpajakan Anda.
                    </p>
                </div>
            </section>

            {/* Model Detail Cards */}
            <section className="relative py-24 bg-gradient-to-b from-neutral-light via-white to-neutral-light overflow-hidden">
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

                <div className="relative z-10 container mx-auto px-6 space-y-20">
                    {models.map((model, idx) => (
                        <div key={model.id} id={model.id} className="scroll-mt-24">
                            <div className={`grid gap-8 lg:gap-12 items-start ${idx % 2 === 1 ? 'lg:grid-cols-[1fr_1.2fr]' : 'lg:grid-cols-[1.2fr_1fr]'}`}>
                                {/* Info Side */}
                                <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-12 h-12 rounded-2xl ${model.iconBg} flex items-center justify-center shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform`}>
                                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <model.Icon />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl md:text-3xl font-bold text-text-dark">{model.name}</h2>
                                            <p className={`text-sm font-semibold ${model.accentText}`}>{model.tagline}</p>
                                        </div>
                                    </div>
                                    <p className="text-text-dark/60 text-lg leading-relaxed mb-6">
                                        {model.description}
                                    </p>

                                    {/* Features */}
                                    <ul className="space-y-3 mb-6">
                                        {model.features.map((feat) => (
                                            <li key={feat} className="flex items-start gap-2.5 text-text-dark/70">
                                                <CheckIcon />
                                                <span className="text-sm">{feat}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Addon Badge */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-text-dark/40">Tersedia di:</span>
                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${model.accentBadge}`}>
                                            {model.addon}
                                        </span>
                                        {model.addon !== 'AI Unlimited' && (
                                            <span className="text-[10px] text-text-dark/30">& tier di atasnya</span>
                                        )}
                                    </div>
                                </div>

                                {/* Best For Card */}
                                <div className={idx % 2 === 1 ? 'lg:order-1' : ''}>
                                    <div className={`rounded-3xl border ${model.accentBorder} ${model.accentBg} p-8`}>
                                        <p className={`text-xs uppercase tracking-[0.25em] font-semibold ${model.accentText} mb-3`}>
                                            Ideal Untuk
                                        </p>
                                        <p className="text-text-dark/70 leading-relaxed">{model.bestFor}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Add-on Tiers Summary */}
            <section className="py-20 bg-gradient-to-b from-neutral-light to-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <p className="text-xs uppercase tracking-[0.4em] text-secondary font-semibold mb-3">AI Add-on</p>
                        <h2 className="text-3xl md:text-4xl font-bold font-playfair text-text-dark mb-4">
                            Akses Model via AI Add-on
                        </h2>
                        <p className="text-text-dark/60 max-w-lg mx-auto">
                            Model AI Owlie tersedia melalui AI Add-on yang dapat ditambahkan ke paket langganan Anda.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
                        {addonTiers.map((tier) => (
                            <div key={tier.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${tier.badge} mb-4`}>
                                    {tier.name}
                                </span>
                                <ul className="space-y-2.5">
                                    {tier.models.map((m) => (
                                        <li key={m} className="flex items-center gap-2 text-sm text-text-dark/70">
                                            <svg className="w-4 h-4 text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            {m}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            href="/pricing"
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-secondary hover:shadow-lg hover:shadow-primary/20"
                        >
                            Lihat Harga & Paket
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer settings={settings.footer} />
        </main>
    );
}
