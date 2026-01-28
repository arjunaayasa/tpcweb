export default function Footer() {
  return (
    <footer className="w-full bg-text-dark text-neutral-light border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 animate-fade-up">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">
              Taxindo Prime Consulting
            </h3>
            <p className="text-sm text-neutral-light/70 leading-relaxed">
              Konsultan pajak modern dengan dukungan AI untuk keputusan yang lebih cepat, akurat, dan aman.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm uppercase tracking-[0.3em] text-neutral-light/60">
              Produk
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href="#" className="hover:text-primary transition-colors">
                Owlie Chat
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Tax Knowledge AI
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Studio AI
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm uppercase tracking-[0.3em] text-neutral-light/60">
              Perusahaan
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href="#" className="hover:text-primary transition-colors">
                Tentang Kami
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Karir
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Hubungi Kami
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm uppercase tracking-[0.3em] text-neutral-light/60">
              Legal
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Security
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-light/60">
          <p>© 2026 Taxindo Prime Consulting. All rights reserved.</p>
          <p>Jakarta, Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
