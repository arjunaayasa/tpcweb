import {
  MessageChatSquare,
  BookOpen01,
  Stars01,
  Hourglass01,
} from '@untitledui/icons';
import type { SiteSettings } from '@/lib/site-settings';

const baseFeatures = [
  {
    title: 'Owlie Chat',
    description:
      'Chat pajak instan untuk pertanyaan regulasi, perhitungan, dan saran yang relevan.',
    icon: MessageChatSquare,
    featured: true,
    gridClass: 'md:col-span-2 lg:col-span-2 lg:row-start-1',
    theme: {
      border: 'border-primary/60',
      fill: 'bg-primary',
      icon: 'bg-primary/10 text-primary',
      label: 'text-primary',
      hoverText: 'group-hover:text-white group-active:text-white',
      hoverMuted: 'group-hover:text-white/80 group-active:text-white/80',
      hoverIcon:
        'group-hover:bg-white/15 group-hover:text-white group-active:bg-white/15 group-active:text-white',
    },
  },
  {
    title: 'Tax Knowledge AI',
    description:
      'Akses basis pengetahuan pajak yang luas, terstruktur, dan selalu siap pakai.',
    icon: BookOpen01,
    featured: true,
    gridClass: 'md:col-span-2 lg:col-span-2 lg:row-start-2',
    theme: {
      border: 'border-secondary/60',
      fill: 'bg-secondary',
      icon: 'bg-secondary/10 text-secondary',
      label: 'text-secondary',
      hoverText: 'group-hover:text-white group-active:text-white',
      hoverMuted: 'group-hover:text-white/80 group-active:text-white/80',
      hoverIcon:
        'group-hover:bg-white/15 group-hover:text-white group-active:bg-white/15 group-active:text-white',
    },
  },
  {
    title: 'Studio AI',
    description:
      'Buat draft dokumen, ringkasan, dan analisis pajak lebih cepat bersama AI.',
    icon: Stars01,
    gridClass: 'lg:col-start-3 lg:row-start-1',
    theme: {
      border: 'border-accent-warm/60',
      fill: 'bg-accent-warm',
      icon: 'bg-accent-warm/10 text-accent-warm',
      label: 'text-accent-warm',
      hoverText: 'group-hover:text-white group-active:text-white',
      hoverMuted: 'group-hover:text-white/80 group-active:text-white/80',
      hoverIcon:
        'group-hover:bg-white/15 group-hover:text-white group-active:bg-white/15 group-active:text-white',
    },
  },
  {
    title: 'Coming Soon',
    description:
      'Fitur baru sedang dipersiapkan untuk memperkuat workflow pajak Anda.',
    icon: Hourglass01,
    gridClass: 'lg:col-start-3 lg:row-start-2',
    static: true,
    theme: {
      border: 'border-slate-200',
      fill: 'bg-slate-100',
      icon: 'bg-slate-200 text-slate-500',
      label: 'text-slate-500',
    },
  },
];

type FeatureCardsProps = {
  settings?: SiteSettings['features'];
};

export default function FeatureCards({ settings }: FeatureCardsProps) {
  const cardOverrides = settings?.cards ?? [];
  const features = baseFeatures.map((feature, index) => {
    const override = cardOverrides[index];
    return {
      ...feature,
      title: override?.title ?? feature.title,
      description: override?.description ?? feature.description,
    };
  });

  return (
    <section id="features" className="py-20 bg-neutral-light">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-bold font-playfair text-text-dark">
            {(() => {
              const title = settings?.title ?? 'Fitur Lengkap TPC AI';
              const parts = title.split('Lengkap');
              if (parts.length === 1) {
                return title;
              }

              return (
                <>
                  {parts[0]}
                  <span className="relative inline-block">
                    <span className="relative z-10">Lengkap</span>
                    <span className="absolute left-0 -bottom-2 h-[3px] w-full rounded-full bg-secondary/80 animate-underline-grow" />
                  </span>
                  {parts.slice(1).join('Lengkap')}
                </>
              );
            })()}
          </h2>
          <p className="text-lg text-text-dark/70 mt-4">
            {settings?.subtitle ?? 'Semua alat penting tersedia dalam satu platform yang rapi dan aman.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-6">
          {features.map((feature, index) => {
            const CardIcon = feature.icon;
            const isStatic = feature.static;
            const animationClass = isStatic ? '' : 'animate-fade-up';
            const hoverClass = isStatic ? '' : 'hover:-translate-y-1 hover:shadow-xl';
            const groupClass = isStatic ? '' : 'group';
            const baseBgClass = isStatic ? 'bg-slate-50' : 'bg-white';
            const headingBase = isStatic ? 'text-slate-600' : 'text-text-dark';
            const bodyBase = isStatic ? 'text-slate-500' : 'text-text-dark/70';
            const hoverText = isStatic
              ? ''
              : feature.theme?.hoverText ??
              'group-hover:text-white group-active:text-white';
            const hoverMuted = isStatic
              ? ''
              : feature.theme?.hoverMuted ??
              'group-hover:text-white/80 group-active:text-white/80';
            const hoverIcon = isStatic
              ? ''
              : feature.theme?.hoverIcon ??
              'group-hover:bg-white/15 group-hover:text-white group-active:bg-white/15 group-active:text-white';
            return (
              <div
                key={feature.title}
                className={`relative overflow-hidden rounded-3xl ${baseBgClass} p-8 shadow-lg border-2 transition-transform duration-300 ${hoverClass} ${animationClass} ${feature.featured ? 'md:p-10' : ''
                  } ${feature.gridClass ?? ''} ${feature.theme?.border ?? 'border-primary/30'} ${groupClass
                  } ${isStatic ? 'cursor-default' : 'cursor-pointer'}`}
                style={{ animationDelay: `${index * 140}ms` }}
              >
                {isStatic ? null : (
                  <div
                    className={`absolute inset-0 z-0 origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 group-active:scale-x-100 ${feature.theme?.fill ?? 'bg-primary'
                      }`}
                  />
                )}

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-5">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${feature.theme?.icon ?? 'bg-primary/10 text-primary'
                        } ${hoverIcon}`}
                    >
                      <CardIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p
                        className={`text-xs uppercase tracking-[0.2em] transition-colors ${feature.theme?.label ?? 'text-secondary'
                          } ${hoverText}`}
                      >
                        Fitur
                      </p>
                      <h3
                        className={`text-2xl md:text-3xl font-semibold transition-colors ${headingBase} ${hoverText
                          }`}
                      >
                        {feature.title}
                      </h3>
                    </div>
                  </div>
                  <p
                    className={`text-base md:text-lg max-w-2xl transition-colors ${bodyBase} ${hoverMuted
                      }`}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
