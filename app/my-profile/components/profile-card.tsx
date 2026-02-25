import { AuthProfileUser } from '@/lib/sso';

type ProfileCardProps = {
    user: AuthProfileUser;
    planLabel: string;
    effectiveAddon?: string;
};

const addonBadgeColors: Record<string, string> = {
    STARTER: 'bg-emerald-100 text-emerald-700',
    PRO: 'bg-teal-100 text-teal-700',
    UNLIMITED: 'bg-amber-100 text-amber-800',
};

const addonBadgeLabels: Record<string, string> = {
    STARTER: 'AI Starter',
    PRO: 'AI Pro',
    UNLIMITED: 'AI Unlimited',
};

export default function ProfileCard({ user, planLabel, effectiveAddon }: ProfileCardProps) {
    const initial = user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase();
    const memberSince = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
        })
        : '-';

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
            <div className="h-24 bg-orange-50 w-full relative"></div>
            <div className="px-6 pb-8 text-center -mt-12 relative z-10">
                <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center text-3xl font-bold text-gray-400 shadow-sm border-4 border-white mb-4">
                    {initial}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {user.name || 'User'}
                </h2>
                <p className="text-sm text-gray-500 mb-4">{user.email}</p>
                <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide mb-2">
                    {planLabel} Plan
                </span>
                {effectiveAddon && effectiveAddon !== 'NONE' && (
                    <span className={`inline-block ${addonBadgeColors[effectiveAddon] || 'bg-gray-100 text-gray-600'} text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide mb-8 ml-1`}>
                        {addonBadgeLabels[effectiveAddon] || effectiveAddon}
                    </span>
                )}
                {(!effectiveAddon || effectiveAddon === 'NONE') && <div className="mb-8" />}
                <div className="border-t border-gray-100 pt-6 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Role</span>
                        <span className="font-semibold text-gray-900 uppercase">User</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Member Since</span>
                        <span className="font-semibold text-gray-900">{memberSince}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
