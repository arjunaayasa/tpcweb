import { fetchOrgInfo, fetchOrgUsage } from '@/lib/org-types';
import MembersClient from './members-client';

export const dynamic = 'force-dynamic';

export default async function OrgMembersPage() {
  const [org, usage] = await Promise.all([fetchOrgInfo(), fetchOrgUsage()]);

  return (
    <MembersClient
      initialMembers={usage?.members ?? []}
      seatLimit={org?.seatLimit ?? 0}
      seatsUsed={org?.seatsUsed ?? usage?.seatsUsed ?? 0}
    />
  );
}
