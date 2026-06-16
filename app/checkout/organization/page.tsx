import { Suspense } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import OrganizationCheckoutClient from './organization-checkout-client';
import { getSiteSettings } from '@/lib/site-settings';

export const metadata = {
    title: 'Buat Organisasi MNC / Group - TPC AI',
    description: 'Daftarkan organisasi Anda untuk paket MNC / Group dan dapatkan subdomain khusus taxindo.ai.',
};

export const dynamic = 'force-dynamic';

export default async function OrganizationCheckoutPage() {
    const settings = await getSiteSettings(['footer']);

    return (
        <main className="min-h-screen flex flex-col bg-gradient-to-b from-neutral-light via-white to-neutral-light">
            <Navbar />
            <div className="flex-1 pt-20">
                <Suspense fallback={
                    <div className="min-h-[60vh] flex items-center justify-center">
                        <div className="inline-flex items-center gap-3 text-text-dark/50">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span className="text-sm">Memuat...</span>
                        </div>
                    </div>
                }>
                    <OrganizationCheckoutClient />
                </Suspense>
            </div>
            <Footer settings={settings.footer} />
        </main>
    );
}
