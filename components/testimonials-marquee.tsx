"use client";

import { motion } from "framer-motion";
import { TestimonialsColumn, type ColumnTestimonial } from "@/components/ui/testimonials-columns-1";

/**
 * Animated, three-column testimonials marquee. Receives the testimonials list (already mapped from
 * the DB) and distributes it across three vertically-scrolling columns.
 */
export default function TestimonialsMarquee({ testimonials }: { testimonials: ColumnTestimonial[] }) {
  const third = Math.ceil(testimonials.length / 3) || 1;
  const safe = (col: ColumnTestimonial[]) => (col.length ? col : testimonials);
  const firstColumn = safe(testimonials.slice(0, third));
  const secondColumn = safe(testimonials.slice(third, third * 2));
  const thirdColumn = safe(testimonials.slice(third * 2));

  return (
    <section id="testimonials" className="relative bg-gradient-to-b from-white to-neutral-light py-24">
      <div className="container z-10 mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-[540px] flex-col items-center justify-center text-center"
        >
          <div className="flex justify-center">
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-1 text-sm font-medium text-text-dark/70">
              Testimoni
            </div>
          </div>
          <h2 className="mt-5 font-playfair text-4xl font-bold tracking-tight text-text-dark md:text-5xl">
            Apa kata pengguna kami
          </h2>
          <p className="mt-5 text-center text-lg text-text-dark/60">
            Cerita nyata dari tim pajak yang bekerja lebih cepat bersama TPC AI.
          </p>
        </motion.div>

        <div className="mt-12 flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
}
