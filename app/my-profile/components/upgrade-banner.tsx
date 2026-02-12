import Link from 'next/link';

export default function UpgradeBanner() {
    return (
        <div className="bg-[#3A3836] rounded-3xl p-6 flex flex-col justify-between h-full shadow-lg transition-all duration-300">
            <div>
                <h3 className="text-lg font-bold text-white mb-2">Upgrade Plan Anda</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Dapatkan akses ke model AI yang lebih canggih dan kuota lebih besar.
                </p>
            </div>
            <Link
                href="/pricing"
                className="block w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-200 text-center"
            >
                Lihat Pricing
            </Link>
        </div>
    );
}
