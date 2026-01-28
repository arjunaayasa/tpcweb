import Navbar from '@/components/navbar';
import Hero from '@/components/hero';
import FeatureCards from '@/components/feature-cards';
import FeatureDetails from '@/components/feature-details';
import Testimonials from '@/components/testimonials';
import Faq from '@/components/faq';
import Footer from '@/components/footer';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <FeatureCards />
      <FeatureDetails />
      <Testimonials />
      <Faq />
      <Footer />
    </main>
  );
}
