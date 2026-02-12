import { prisma } from '@/lib/prisma';

export const DEFAULT_SETTINGS = {
  redirects: {
    owlieChat: '',
    taxKnowledge: '',
  },
  hero: {
    title: 'Intelligent Tax Solutions',
    subtitle: 'Powered by TPC AI. Experience the future of consulting.',
    ctaPrimary: 'Owlie Chat',
    ctaSecondary: 'Tax Knowledge AI',
    placeholders: [
      'Tanya tentang batas waktu pelaporan SPT?',
      'Bagaimana cara menghitung PPh 21 karyawan?',
      'Apa saja syarat pengkreditan PPN masukan?',
      'Kapan wajib lapor pajak tahunan perusahaan?',
      'Bagaimana perlakuan pajak untuk transaksi ekspor?',
      'Bolehkan biaya ini dibebankan dalam laporan pajak?',
    ],
  },
  features: {
    title: 'Fitur Lengkap TPC AI',
    subtitle: 'Semua alat penting tersedia dalam satu platform yang rapi dan aman.',
    cards: [
      {
        title: 'Owlie Chat',
        description:
          'Chat pajak instan untuk pertanyaan regulasi, perhitungan, dan saran yang relevan.',
      },
      {
        title: 'Tax Knowledge AI',
        description:
          'Akses basis pengetahuan pajak yang luas, terstruktur, dan selalu siap pakai.',
      },
      {
        title: 'Studio AI',
        description:
          'Buat draft dokumen, ringkasan, dan analisis pajak lebih cepat bersama AI.',
      },
      {
        title: 'Coming Soon',
        description:
          'Fitur baru sedang dipersiapkan untuk memperkuat workflow pajak Anda.',
      },
    ],
  },
  featureDetails: {
    items: [
      {
        name: 'Owlie Chat',
        headline: 'Owlie Chat untuk bertanya apapun yang anda inginkan tentang pajak.',
        description:
          'Gunakan bahasa sehari-hari untuk konsultasi pajak, cek pasal, hingga minta ringkasan. Owlie menjawab cepat dengan konteks yang jelas dan mudah dipahami.',
        imageLabel: 'Owlie Chat Preview',
      },
      {
        name: 'Tax Knowledge AI',
        headline: 'Tax Knowledge AI untuk eksplorasi aturan, referensi, dan pasal pajak.',
        description:
          'Temukan rujukan pajak dengan pencarian cerdas, struktur rapi, dan jawaban yang konsisten. Cocok untuk tim pajak yang butuh data cepat dan akurat.',
        imageLabel: 'Tax Knowledge AI Preview',
      },
      {
        name: 'Studio AI',
        headline: 'Studio AI untuk menyusun draft dokumen pajak lebih cepat.',
        description:
          'Buat draft surat, ringkasan laporan, hingga memo internal dengan format yang profesional. Studio AI membantu merapikan tulisan sehingga siap dikirim.',
        imageLabel: 'Studio AI Preview',
      },
    ],
  },
  faq: {
    title: 'FAQ',
    subtitle: 'Jawaban cepat untuk pertanyaan yang paling sering ditanyakan.',
    items: [
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
    ],
    side: {
      kicker: 'Panduan Singkat',
      title: 'Berikut ini adalah ringkasan singkat seputar layanan TPC AI.',
      body: 'Gunakan FAQ ini untuk memahami cara kerja Owlie Chat, Tax Knowledge AI, hingga Studio AI. Jika masih ada pertanyaan, tim kami siap membantu Anda.',
      bullets: [
        'Owlie Chat untuk konsultasi pajak instan.',
        'Tax Knowledge AI untuk riset regulasi.',
        'Studio AI untuk draft dokumen pajak.',
      ],
    },
  },
  footer: {
    tagline:
      'Konsultan pajak modern dengan dukungan AI untuk keputusan yang lebih cepat, akurat, dan aman.',
    location: 'Jakarta, Indonesia',
    sections: [
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
    ],
  },
};

export type SiteSettings = typeof DEFAULT_SETTINGS;
export type SiteSettingsKey = keyof SiteSettings;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const mergeDeep = (base: Record<string, unknown>, override: Record<string, unknown>) => {
  const result: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = mergeDeep(result[key] as Record<string, unknown>, value);
    } else {
      result[key] = value;
    }
  }

  return result;
};

export const getSiteSettings = async (
  keys: SiteSettingsKey[] = Object.keys(DEFAULT_SETTINGS) as SiteSettingsKey[],
) => {
  const settings = structuredClone(DEFAULT_SETTINGS) as Record<string, unknown>;
  const records = await prisma.siteSetting.findMany({
    where: { key: { in: keys } },
  });

  for (const record of records) {
    const key = record.key as SiteSettingsKey;
    if (!(key in settings)) {
      continue;
    }

    if (record.value && isPlainObject(record.value)) {
      const current = settings[key] as Record<string, unknown>;
      settings[key] = mergeDeep(current, record.value);
    }
  }

  return settings as SiteSettings;
};
