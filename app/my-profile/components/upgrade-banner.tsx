import Link from 'next/link';

export default function UpgradeBanner() {
    return (
        <div className="bg-[#3A3836] rounded-3xl p-6 flex flex-col justify-between shadow-lg transition-all duration-300">
            <div>
                <h3 className="text-lg font-bold text-white mb-2">Aktifkan AI Add-on</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Akses model AI seperti Owlie Chat, Owlie Thinking, dan Owlie Max dengan mengaktifkan AI Add-on.
                </p>
            </div>
            <Link
                href="/pricing"
                className="block w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-200 text-center"
            >
                Lihat AI Add-on
            </Link>
        </div>
    );
}
