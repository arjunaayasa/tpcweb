import Navbar from '@/components/navbar';
import Hero from '@/components/hero';
import FeatureCards from '@/components/feature-cards';
import FeatureDetails from '@/components/feature-details';
import Testimonials from '@/components/testimonials';
import Pricing from '@/components/pricing';
import Faq from '@/components/faq';
import Footer from '@/components/footer';
import { getSiteSettings } from '@/lib/site-settings';

export default async function Home() {
  const settings = await getSiteSettings();

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <Hero settings={settings.hero} redirects={settings.redirects} />
      <FeatureCards settings={settings.features} />
      <FeatureDetails settings={settings.featureDetails} />
      <Testimonials />
      <Pricing compact />
      <Faq settings={settings.faq} />
      <Footer settings={settings.footer} />
    </main>
  );
}

