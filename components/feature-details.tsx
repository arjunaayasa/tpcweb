import type { SiteSettings } from '@/lib/site-settings';

const defaultDetailSections = [
  {
    name: 'Owlie Chat',
    headline: 'Owlie Chat untuk bertanya apapun yang anda inginkan tentang pajak.',
    description:
      'Gunakan bahasa sehari-hari untuk konsultasi pajak, cek pasal, hingga minta ringkasan. Owlie menjawab cepat dengan konteks yang jelas dan mudah dipahami.',
    imageLabel: 'Owlie Chat Preview',
    imageUrl: '',
  },
  {
    name: 'Tax Knowledge AI',
    headline: 'Tax Knowledge AI untuk eksplorasi aturan, referensi, dan pasal pajak.',
    description:
      'Temukan rujukan pajak dengan pencarian cerdas, struktur rapi, dan jawaban yang konsisten. Cocok untuk tim pajak yang butuh data cepat dan akurat.',
    imageLabel: 'Tax Knowledge AI Preview',
    imageUrl: '',
  },
  {
    name: 'Studio AI',
    headline: 'Studio AI untuk menyusun draft dokumen pajak lebih cepat.',
    description:
      'Buat draft surat, ringkasan laporan, hingga memo internal dengan format yang profesional. Studio AI membantu merapikan tulisan sehingga siap dikirim.',
    imageLabel: 'Studio AI Preview',
    imageUrl: '',
  },
];

type FeatureDetailsProps = {
  settings?: SiteSettings['featureDetails'];
};

export default function FeatureDetails({ settings }: FeatureDetailsProps) {
  const detailSections = settings?.items?.length ? settings.items : defaultDetailSections;

  return (
    <section id="products" className="py-20 bg-gradient-to-b from-neutral-light to-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="space-y-20">
          {detailSections.map((section, index) => (
            <div
              key={section.name}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div
                className="space-y-4 animate-slide-in-left"
                style={{ animationDelay: `${index * 140}ms` }}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
                  {section.name}
                </p>
                <h3 className="text-3xl md:text-4xl font-bold font-playfair text-text-dark">
                  {section.headline}
                </h3>
                <p className="text-lg text-text-dark/75">
                  {section.description}
                </p>
              </div>

              <div
                className="animate-slide-in-right"
                style={{ animationDelay: `${index * 140 + 120}ms` }}
              >
                <div className="w-full aspect-[16/9] rounded-3xl border border-dashed border-primary/40 bg-white shadow-sm flex items-center justify-center text-sm text-text-dark/50 overflow-hidden relative">
                  {section.imageUrl ? (
                    <img
                      src={section.imageUrl}
                      alt={section.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    section.imageLabel
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
