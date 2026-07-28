import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { getSiteSettings } from '@/lib/site-settings';

export const metadata = {
    title: 'Download Aplikasi Desktop - TPC AI',
    description:
        'Unduh aplikasi desktop Taxindo Prime Consulting untuk Windows dan macOS. Akses Owlie AI dan asisten pajak Anda langsung dari desktop.',
};

export const dynamic = 'force-dynamic';

/* ── Platform data ── */
type DownloadOption = {
    label: string;
    sublabel: string;
    href: string;
};

type Platform = {
    id: string;
    name: string;
    tagline: string;
    requirement: string;
    accentBg: string;
    accentBorder: string;
    iconBg: string;
    Icon: () => React.ReactElement;
    options: DownloadOption[];
};

const WindowsIcon = () => (
    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 5.557l7.357-1.002.004 7.097-7.354.042L3 5.557zm7.354 6.913l.006 7.103-7.354-1.011v-6.14l7.348.048zM11.252 4.42L21 3v8.562l-9.748.077V4.42zM21 12.538L20.998 21l-9.748-1.376-.014-7.101L21 12.538z" />
    </svg>
);

const AppleIcon = () => (
    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.07-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z" />
    </svg>
);

const platforms: Platform[] = [
    {
        id: 'windows',
        name: 'Windows',
        tagline: 'Untuk Windows 10 & 11',
        requirement: 'Windows 10 (64-bit) atau lebih baru · ~120 MB',
        accentBg: 'bg-blue-50',
        accentBorder: 'border-blue-200',
        iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
        Icon: WindowsIcon,
        options: [
            { label: 'Download untuk Windows', sublabel: 'Installer .exe (64-bit)', href: '#' },
        ],
    },
    {
        id: 'macos',
        name: 'macOS',
        tagline: 'Untuk Apple Silicon & Intel',
        requirement: 'macOS 11 Big Sur atau lebih baru · ~130 MB',
        accentBg: 'bg-slate-50',
        accentBorder: 'border-slate-200',
        iconBg: 'bg-gradient-to-br from-slate-700 to-slate-900',
        Icon: AppleIcon,
        options: [
            { label: 'Download untuk Apple Silicon', sublabel: 'Universal .dmg (M1/M2/M3)', href: '#' },
            { label: 'Download untuk Intel', sublabel: 'Installer .dmg (x86_64)', href: '#' },
        ],
    },
];

const steps = [
    {
        title: 'Unduh installer',
        description: 'Pilih platform Anda — Windows atau macOS — lalu unduh installer terbaru.',
    },
    {
        title: 'Pasang aplikasi',
        description: 'Buka file installer dan ikuti petunjuk instalasi hingga selesai.',
    },
    {
        title: 'Masuk & mulai',
        description: 'Login dengan akun TPC Anda dan mulai gunakan asisten pajak Owlie dari desktop.',
    },
];

const DownloadIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export default async function DownloadPage() {
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
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.35]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                        color: 'var(--color-primary, #0d9488)',
                    }}
                />

                <div className="relative z-10 container mx-auto px-6 text-center">
                    <p className="text-xs uppercase tracking-[0.5em] text-secondary font-semibold mb-4">
                        Download
                    </p>
                    <h1 className="text-4xl md:text-6xl font-bold font-playfair text-text-dark mb-6">
                        Aplikasi Desktop <span className="text-primary">TPC</span>
                    </h1>
                    <p className="text-lg md:text-xl text-text-dark/60 max-w-2xl mx-auto leading-relaxed">
                        Bawa asisten pajak Owlie ke desktop Anda. Cepat, fokus, dan selalu siap — tersedia untuk Windows dan macOS.
                    </p>
                </div>
            </section>

            {/* Download Cards */}
            <section className="relative py-20 bg-gradient-to-b from-neutral-light via-white to-neutral-light overflow-hidden">
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

                <div className="relative z-10 container mx-auto px-6">
                    <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                        {platforms.map((platform) => (
                            <div
                                key={platform.id}
                                className={`rounded-3xl border ${platform.accentBorder} ${platform.accentBg} p-8 flex flex-col`}
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div
                                        className={`w-14 h-14 rounded-2xl ${platform.iconBg} flex items-center justify-center shadow-lg`}
                                    >
                                        <platform.Icon />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-text-dark">{platform.name}</h2>
                                        <p className="text-sm font-semibold text-text-dark/50">{platform.tagline}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 mb-6">
                                    {platform.options.map((option) => (
                                        <a
                                            key={option.label}
                                            href={option.href}
                                            className="group flex items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-4 text-white transition-all hover:bg-secondary hover:shadow-lg hover:shadow-primary/20"
                                        >
                                            <span className="flex flex-col">
                                                <span className="text-sm font-bold">{option.label}</span>
                                                <span className="text-xs text-white/70">{option.sublabel}</span>
                                            </span>
                                            <span className="flex-shrink-0 transition-transform group-hover:translate-y-0.5">
                                                <DownloadIcon />
                                            </span>
                                        </a>
                                    ))}
                                </div>

                                <p className="mt-auto text-xs text-text-dark/40">{platform.requirement}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How to install */}
            <section className="py-20 bg-gradient-to-b from-neutral-light to-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <p className="text-xs uppercase tracking-[0.4em] text-secondary font-semibold mb-3">
                            Cara Memasang
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold font-playfair text-text-dark mb-4">
                            Tiga Langkah Mudah
                        </h2>
                        <p className="text-text-dark/60 max-w-lg mx-auto">
                            Pasang aplikasi desktop dan mulai gunakan dalam hitungan menit.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
                        {steps.map((step, idx) => (
                            <div
                                key={step.title}
                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold mb-4">
                                    {idx + 1}
                                </span>
                                <h3 className="text-lg font-bold text-text-dark mb-2">{step.title}</h3>
                                <p className="text-sm text-text-dark/60 leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer settings={settings.footer} />
        </main>
    );
}
