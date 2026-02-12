import Navbar from '@/components/navbar';
import Pricing from '@/components/pricing';
import PricingFaq from '@/components/pricing-faq';
import Footer from '@/components/footer';
import { getSiteSettings } from '@/lib/site-settings';

export const metadata = {
    title: 'Harga & Paket - TPC AI',
    description: 'Pilih paket terbaik untuk kebutuhan konsultasi pajak AI Anda. Mulai gratis atau upgrade ke paket premium.',
};

export default async function PricingPage() {
    const settings = await getSiteSettings(['footer']);

    return (
        <main className="min-h-screen flex flex-col">
            <Navbar />
            <div className="pt-20">
                <Pricing />
                <PricingFaq />
            </div>
            <Footer settings={settings.footer} />
        </main>
    );
}
