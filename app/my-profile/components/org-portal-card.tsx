import Link from 'next/link';

type OrgPortalCardProps = {
  orgRole?: 'ADMIN' | 'MEMBER' | null;
  plan?: string | null;
  organizationId?: string | null;
};

/**
 * Surfaces the MNC/Group organization portal on the profile page.
 *
 * - Org ADMIN → link to the org portal (`/org`).
 * - MNC plan but no organization yet → link to the no-payment setup (`/org-setup`).
 * - Otherwise renders nothing.
 */
export default function OrgPortalCard({ orgRole, plan, organizationId }: OrgPortalCardProps) {
  const isOrgAdmin = orgRole === 'ADMIN';
  const canSetup = !isOrgAdmin && plan === 'MNC' && !organizationId;

  if (!isOrgAdmin && !canSetup) {
    return null;
  }

  const href = isOrgAdmin ? '/org' : '/org-setup';
  const cta = isOrgAdmin ? 'Buka Portal' : 'Aktifkan Sekarang';
  const description = isOrgAdmin
    ? 'Kelola anggota, kursi, dan penggunaan organisasi Anda.'
    : 'Paket MNC/Group Anda aktif. Aktifkan portal organisasi dan subdomain khusus tanpa biaya tambahan.';

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 transition-all duration-300">
      <div className="flex items-center gap-2 mb-3 text-primary">
        <span className="material-icons-round text-xl">corporate_fare</span>
        <h3 className="text-lg font-bold text-gray-900">Portal Organisasi</h3>
        <span className="ml-auto rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white">
          MNC / Group
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-4 leading-relaxed">{description}</p>
      <Link
        href={href}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
      >
        {cta}
        <span className="material-icons-round text-base">arrow_forward</span>
      </Link>
    </div>
  );
}
