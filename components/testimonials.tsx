import { prisma } from '@/lib/prisma';
import { DEFAULT_TESTIMONIALS, DEFAULT_TESTIMONIAL_PHOTO_URL } from '@/lib/testimonials';
import TestimonialsMarquee from '@/components/testimonials-marquee';
import type { ColumnTestimonial } from '@/components/ui/testimonials-columns-1';

/**
 * Server component: loads testimonials from the DB (falls back to defaults), maps them to the
 * marquee shape, and renders the animated three-column marquee.
 */
export default async function Testimonials() {
  let storedTestimonials = [] as Array<{
    id: string;
    quote: string;
    name: string;
    role: string;
    company: string;
    photoUrl: string;
  }>;

  try {
    storedTestimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    storedTestimonials = [];
  }

  const source = storedTestimonials.length ? storedTestimonials : DEFAULT_TESTIMONIALS;

  const testimonials: ColumnTestimonial[] = source.map((item) => ({
    text: item.quote,
    image: item.photoUrl || DEFAULT_TESTIMONIAL_PHOTO_URL,
    name: item.name,
    role: item.company ? `${item.role}, ${item.company}` : item.role,
  }));

  return <TestimonialsMarquee testimonials={testimonials} />;
}
