const testimonials = [
  {
    quote:
      'Owlie Chat membantu tim kami menjawab pertanyaan pajak klien dalam hitungan menit, bukan jam.',
    name: 'Rina S.',
    role: 'Head of Tax',
    company: 'FinTax Group',
    initials: 'RS',
    photo: '/images/testimonials/avatar-placeholder.svg',
  },
  {
    quote:
      'Tax Knowledge AI membuat pencarian pasal pajak jauh lebih cepat dan rapi untuk disusun dalam laporan.',
    name: 'Budi P.',
    role: 'Finance Manager',
    company: 'Nusantara Logistik',
    initials: 'BP',
    photo: '/images/testimonials/avatar-placeholder.svg',
  },
  {
    quote:
      'Studio AI merapikan draft memo pajak kami sehingga bisa langsung dipakai untuk approval internal.',
    name: 'Anita L.',
    role: 'Senior Consultant',
    company: 'Prime Advisory',
    initials: 'AL',
    photo: '/images/testimonials/avatar-placeholder.svg',
  },
  {
    quote:
      'TPC AI membuat proses review pajak lebih efisien tanpa mengorbankan akurasi.',
    name: 'Dewi M.',
    role: 'CFO',
    company: 'Arjuna Manufacturing',
    initials: 'DM',
    photo: '/images/testimonials/avatar-placeholder.svg',
  },
  {
    quote:
      'Platform ini membantu kami fokus pada strategi, bukan sekadar mengulang pencarian regulasi.',
    name: 'Rafi A.',
    role: 'Tax Analyst',
    company: 'Summit Holdings',
    initials: 'RA',
    photo: '/images/testimonials/avatar-placeholder.svg',
  },
];

const floatDurations = ['7s', '8s', '9s', '7.5s', '8.5s'];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-gradient-to-b from-white to-neutral-light">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-bold text-text-dark">
            Testimonial Klien
          </h2>
          <p className="text-lg text-text-dark/70 mt-4">
            Cerita nyata dari tim pajak yang bekerja lebih cepat bersama TPC AI.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {testimonials.map((item, index) => (
            <div
              key={item.name}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div
                className="relative w-full max-w-[320px] aspect-square rounded-3xl bg-white p-6 md:p-7 shadow-xl border border-white/70 animate-float flex flex-col justify-between overflow-visible"
                style={{
                  animationDuration: floatDurations[index % floatDurations.length],
                  animationDelay: `${index * 120}ms`,
                }}
              >
                <div className="absolute left-4 -bottom-2 h-4 w-4 bg-white border border-white/70 rotate-45 shadow-md" />
                <span
                  className="absolute right-6 top-4 text-6xl text-primary/15 leading-none"
                  aria-hidden="true"
                >
                  &rdquo;
                </span>
                <p className="text-base md:text-lg text-text-dark leading-relaxed pr-6">
                  {item.quote}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="absolute -left-8 -bottom-8">
                    <img
                      src={item.photo}
                      alt={item.name}
                      className="h-12 w-12 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  </div>
                  <div className="text-sm text-text-dark/70 pl-10">
                    <span className="font-semibold text-text-dark">{item.name}</span>
                    <div className="text-text-dark/60">
                      {item.role} - {item.company}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
