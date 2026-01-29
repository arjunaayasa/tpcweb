export const DEFAULT_TESTIMONIAL_PHOTO_URL =
  '/images/testimonials/avatar-placeholder.svg';

export const DEFAULT_TESTIMONIALS = [
  {
    id: 'fallback-1',
    quote:
      'Owlie Chat membantu tim kami menjawab pertanyaan pajak klien dalam hitungan menit, bukan jam.',
    name: 'Rina S.',
    role: 'Head of Tax',
    company: 'FinTax Group',
    photoUrl: DEFAULT_TESTIMONIAL_PHOTO_URL,
  },
  {
    id: 'fallback-2',
    quote:
      'Tax Knowledge AI membuat pencarian pasal pajak jauh lebih cepat dan rapi untuk disusun dalam laporan.',
    name: 'Budi P.',
    role: 'Finance Manager',
    company: 'Nusantara Logistik',
    photoUrl: DEFAULT_TESTIMONIAL_PHOTO_URL,
  },
  {
    id: 'fallback-3',
    quote:
      'Studio AI merapikan draft memo pajak kami sehingga bisa langsung dipakai untuk approval internal.',
    name: 'Anita L.',
    role: 'Senior Consultant',
    company: 'Prime Advisory',
    photoUrl: DEFAULT_TESTIMONIAL_PHOTO_URL,
  },
  {
    id: 'fallback-4',
    quote:
      'TPC AI membuat proses review pajak lebih efisien tanpa mengorbankan akurasi.',
    name: 'Dewi M.',
    role: 'CFO',
    company: 'Arjuna Manufacturing',
    photoUrl: DEFAULT_TESTIMONIAL_PHOTO_URL,
  },
  {
    id: 'fallback-5',
    quote:
      'Platform ini membantu kami fokus pada strategi, bukan sekadar mengulang pencarian regulasi.',
    name: 'Rafi A.',
    role: 'Tax Analyst',
    company: 'Summit Holdings',
    photoUrl: DEFAULT_TESTIMONIAL_PHOTO_URL,
  },
] as const;
