# Landing Content Props Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fetch landing-page content keys (`hero`, `features`, `featureDetails`, `faq`, `footer`) and pass them into the relevant components.

**Architecture:** Add a single `lib/landing-content.ts` module that exports an async `fetchLandingContent()` returning a typed content object. `app/page.tsx` will fetch once and pass props to the sections. Components will accept typed props and render from data instead of inline arrays, keeping client components serializable.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Vitest.

---

### Task 1: Create landing content module and tests

**Files:**
- Create: `lib/landing-content.ts`
- Create: `tests/content/landing-content.test.ts`

**Step 1: Write the failing test**

Create `tests/content/landing-content.test.ts`:
```ts
import { describe, expect, test } from 'vitest';
import { fetchLandingContent } from '@/lib/landing-content';

describe('landing content', () => {
  test('returns required content keys', async () => {
    const content = await fetchLandingContent();

    expect(content).toHaveProperty('hero');
    expect(content).toHaveProperty('features');
    expect(content).toHaveProperty('featureDetails');
    expect(content).toHaveProperty('faq');
    expect(content).toHaveProperty('footer');
    expect(Array.isArray(content.features)).toBe(true);
    expect(Array.isArray(content.featureDetails)).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/content/landing-content.test.ts`
Expected: FAIL with "Cannot find module '@/lib/landing-content'".

**Step 3: Write minimal implementation**

Create `lib/landing-content.ts`:
```ts
export type HeroContent = {
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  placeholders: string[];
  inputLabel: string;
  sendLabel: string;
};

export type FeatureCard = {
  title: string;
  description: string;
  icon: 'message' | 'book' | 'stars' | 'hourglass';
  featured?: boolean;
  gridClass?: string;
  static?: boolean;
  theme: {
    border: string;
    fill?: string;
    icon: string;
    label: string;
    hoverText?: string;
    hoverMuted?: string;
    hoverIcon?: string;
  };
};

export type FeatureDetail = {
  name: string;
  headline: string;
  description: string;
  imageLabel: string;
};

export type FaqContent = {
  title: string;
  intro: string;
  items: Array<{ question: string; answer: string }>;
  sidebarLabel: string;
  sidebarTitle: string;
  sidebarBody: string;
  sidebarBullets: string[];
};

export type FooterContent = {
  brand: {
    name: string;
    description: string;
  };
  columns: Array<{ title: string; links: Array<{ label: string; href: string }> }>;
  copyright: string;
  location: string;
};

export type LandingContent = {
  hero: HeroContent;
  features: FeatureCard[];
  featureDetails: FeatureDetail[];
  faq: FaqContent;
  footer: FooterContent;
};

const landingContent: LandingContent = {
  hero: {
    title: 'Intelligent Tax Solutions',
    subtitle: 'Powered by TPC AI. Experience the future of consulting.',
    primaryCta: 'Owlie Chat',
    secondaryCta: 'Tax Knowledge AI',
    placeholders: [
      'Tanya tentang batas waktu pelaporan SPT?',
      'Bagaimana cara menghitung PPh 21 karyawan?',
      'Apa saja syarat pengkreditan PPN masukan?',
      'Kapan wajib lapor pajak tahunan perusahaan?',
      'Bagaimana perlakuan pajak untuk transaksi ekspor?',
      'Bolehkan biaya ini dibebankan dalam laporan pajak?',
    ],
    inputLabel: 'Pertanyaan pajak',
    sendLabel: 'Kirim',
  },
  features: [
    {
      title: 'Owlie Chat',
      description:
        'Chat pajak instan untuk pertanyaan regulasi, perhitungan, dan saran yang relevan.',
      icon: 'message',
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
      icon: 'book',
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
      icon: 'stars',
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
      icon: 'hourglass',
      gridClass: 'lg:col-start-3 lg:row-start-2',
      static: true,
      theme: {
        border: 'border-slate-200',
        fill: 'bg-slate-100',
        icon: 'bg-slate-200 text-slate-500',
        label: 'text-slate-500',
      },
    },
  ],
  featureDetails: [
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
  faq: {
    title: 'FAQ',
    intro: 'Jawaban cepat untuk pertanyaan yang paling sering ditanyakan.',
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
    sidebarLabel: 'Panduan Singkat',
    sidebarTitle: 'Berikut ini adalah ringkasan singkat seputar layanan TPC AI.',
    sidebarBody:
      'Gunakan FAQ ini untuk memahami cara kerja Owlie Chat, Tax Knowledge AI, hingga Studio AI. Jika masih ada pertanyaan, tim kami siap membantu Anda.',
    sidebarBullets: [
      'Owlie Chat untuk konsultasi pajak instan.',
      'Tax Knowledge AI untuk riset regulasi.',
      'Studio AI untuk draft dokumen pajak.',
    ],
  },
  footer: {
    brand: {
      name: 'Taxindo Prime Consulting',
      description:
        'Konsultan pajak modern dengan dukungan AI untuk keputusan yang lebih cepat, akurat, dan aman.',
    },
    columns: [
      {
        title: 'Produk',
        links: [
          { label: 'Owlie Chat', href: '#' },
          { label: 'Tax Knowledge AI', href: '#' },
          { label: 'Studio AI', href: '#' },
        ],
      },
      {
        title: 'Perusahaan',
        links: [
          { label: 'Tentang Kami', href: '#' },
          { label: 'Karir', href: '#' },
          { label: 'Hubungi Kami', href: '#' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { label: 'Privacy Policy', href: '#' },
          { label: 'Terms of Service', href: '#' },
          { label: 'Security', href: '#' },
        ],
      },
    ],
    copyright: '© 2026 Taxindo Prime Consulting. All rights reserved.',
    location: 'Jakarta, Indonesia',
  },
};

export async function fetchLandingContent(): Promise<LandingContent> {
  return landingContent;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/content/landing-content.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/landing-content.ts tests/content/landing-content.test.ts
git commit -m "feat: centralize landing content"
```

---

### Task 2: Fetch landing content in the home page

**Files:**
- Modify: `app/page.tsx`

**Step 1: Write the failing test**

Add a simple render test (if no UI test setup exists, skip and proceed to manual check) to confirm props are passed:
```ts
// Optional if React testing not configured.
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/content/landing-content.test.ts`
Expected: PASS (no new test), proceed to code change.

**Step 3: Write minimal implementation**

Update `app/page.tsx`:
```tsx
import Navbar from '@/components/navbar';
import Hero from '@/components/hero';
import FeatureCards from '@/components/feature-cards';
import FeatureDetails from '@/components/feature-details';
import Testimonials from '@/components/testimonials';
import Faq from '@/components/faq';
import Footer from '@/components/footer';
import { fetchLandingContent } from '@/lib/landing-content';

export default async function Home() {
  const { hero, features, featureDetails, faq, footer } = await fetchLandingContent();

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <Hero hero={hero} />
      <FeatureCards features={features} />
      <FeatureDetails featureDetails={featureDetails} />
      <Testimonials />
      <Faq faq={faq} />
      <Footer footer={footer} />
    </main>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/content/landing-content.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "feat: fetch landing content on home"
```

---

### Task 3: Update Hero to accept fetched content

**Files:**
- Modify: `components/hero.tsx`

**Step 1: Write the failing test**

If no UI tests, skip and validate via manual check after implementation.

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/content/landing-content.test.ts`
Expected: PASS.

**Step 3: Write minimal implementation**

Update `components/hero.tsx`:
```tsx
import type { HeroContent } from '@/lib/landing-content';

export default function Hero({ hero }: { hero: HeroContent }) {
  const { title, subtitle, primaryCta, secondaryCta, placeholders, inputLabel, sendLabel } = hero;
  // existing state + rendering, swap strings for these values
}
```

Use `inputLabel` in the `label` element and `sendLabel` for the send button `aria-label`.

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/content/landing-content.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add components/hero.tsx
git commit -m "refactor: drive hero copy from content"
```

---

### Task 4: Update FeatureCards to accept fetched content

**Files:**
- Modify: `components/feature-cards.tsx`

**Step 1: Write the failing test**

If no UI tests, skip and validate via manual check after implementation.

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/content/landing-content.test.ts`
Expected: PASS.

**Step 3: Write minimal implementation**

Update `components/feature-cards.tsx`:
```tsx
import type { FeatureCard } from '@/lib/landing-content';

const iconMap = {
  message: MessageChatSquare,
  book: BookOpen01,
  stars: Stars01,
  hourglass: Hourglass01,
} as const;

export default function FeatureCards({ features }: { features: FeatureCard[] }) {
  // replace local array with props
  const CardIcon = iconMap[feature.icon];
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/content/landing-content.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add components/feature-cards.tsx
git commit -m "refactor: pass feature cards content"
```

---

### Task 5: Update FeatureDetails to accept fetched content

**Files:**
- Modify: `components/feature-details.tsx`

**Step 1: Write the failing test**

If no UI tests, skip and validate via manual check after implementation.

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/content/landing-content.test.ts`
Expected: PASS.

**Step 3: Write minimal implementation**

Update `components/feature-details.tsx`:
```tsx
import type { FeatureDetail } from '@/lib/landing-content';

export default function FeatureDetails({ featureDetails }: { featureDetails: FeatureDetail[] }) {
  return (
    <section id="products" className="py-20 bg-gradient-to-b from-neutral-light to-white">
      {/* use featureDetails.map(...) */}
    </section>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/content/landing-content.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add components/feature-details.tsx
git commit -m "refactor: pass feature details content"
```

---

### Task 6: Update FAQ to accept fetched content

**Files:**
- Modify: `components/faq.tsx`

**Step 1: Write the failing test**

If no UI tests, skip and validate via manual check after implementation.

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/content/landing-content.test.ts`
Expected: PASS.

**Step 3: Write minimal implementation**

Update `components/faq.tsx`:
```tsx
import type { FaqContent } from '@/lib/landing-content';

export default function Faq({ faq }: { faq: FaqContent }) {
  const { title, intro, items, sidebarLabel, sidebarTitle, sidebarBody, sidebarBullets } = faq;
  // render from these values
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/content/landing-content.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add components/faq.tsx
git commit -m "refactor: pass faq content"
```

---

### Task 7: Update Footer to accept fetched content

**Files:**
- Modify: `components/footer.tsx`

**Step 1: Write the failing test**

If no UI tests, skip and validate via manual check after implementation.

**Step 2: Run test to verify it fails**

Run: `npm run test -- tests/content/landing-content.test.ts`
Expected: PASS.

**Step 3: Write minimal implementation**

Update `components/footer.tsx`:
```tsx
import type { FooterContent } from '@/lib/landing-content';

export default function Footer({ footer }: { footer: FooterContent }) {
  const { brand, columns, copyright, location } = footer;
  // map columns + links from data
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- tests/content/landing-content.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add components/footer.tsx
git commit -m "refactor: pass footer content"
```

---

### Task 8: Manual verification and final check

**Files:**
- None

**Step 1: Run dev server and spot-check UI**

Run: `npm run dev`
Expected: Home page renders identically with content passed as props.

**Step 2: Optional lint**

Run: `npm run lint`
Expected: PASS.

**Step 3: Commit (if needed)**

```bash
git add .
git commit -m "chore: verify landing content wiring"
```
