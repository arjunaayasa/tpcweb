import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import KycClient from './kyc-client';
import { getSiteSettings } from '@/lib/site-settings';

export const metadata = {
    title: 'Verifikasi Status Pelajar (KYC) - TPC AI',
    description: 'Unggah kartu pelajar/mahasiswa untuk verifikasi status dan mengaktifkan paket Student.',
};

export const dynamic = 'force-dynamic';

export default async function KycPage() {
    const settings = await getSiteSettings(['footer']);

    return (
        <main className="min-h-screen flex flex-col bg-gradient-to-b from-neutral-light via-white to-neutral-light">
            <Navbar />
            <div className="flex-1 pt-20">
                <KycClient />
            </div>
            <Footer settings={settings.footer} />
        </main>
    );
}
