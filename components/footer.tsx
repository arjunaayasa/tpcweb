import type { SiteSettings } from '@/lib/site-settings';

type FooterProps = {
  settings?: SiteSettings['footer'];
};

export default function Footer({ settings }: FooterProps) {
  const sections = settings?.sections ?? [
    {
      title: 'Produk',
      links: ['Owlie Chat', 'Tax Knowledge AI', 'Studio AI'],
    },
    {
      title: 'Perusahaan',
      links: ['Tentang Kami', 'Karir', 'Hubungi Kami'],
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'Security'],
    },
  ];

  return (
    <footer className="w-full bg-text-dark text-neutral-light border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 animate-fade-up">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">
              Taxindo Prime Consulting
            </h3>
            <p className="text-sm text-neutral-light/70 leading-relaxed">
              {settings?.tagline ?? 'Konsultan pajak modern dengan dukungan AI untuk keputusan yang lebih cepat, akurat, dan aman.'}
            </p>
          </div>
          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="text-sm uppercase tracking-[0.3em] text-neutral-light/60">
                {section.title}
              </h4>
              <div className="flex flex-col gap-2 text-sm">
                {section.links.map((link) => (
                  <a key={link} href="#" className="hover:text-primary transition-colors">
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-light/60">
          <p>© 2026 Taxindo Prime Consulting. All rights reserved.</p>
          <p>{settings?.location ?? 'Jakarta, Indonesia'}</p>
        </div>
      </div>
    </footer>
  );
}
