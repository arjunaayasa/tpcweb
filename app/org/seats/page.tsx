import { fetchOrgInfo } from '@/lib/org-types';
import SeatsClient from './seats-client';

export const dynamic = 'force-dynamic';

export default async function OrgSeatsPage() {
  const org = await fetchOrgInfo();

  return (
    <SeatsClient
      seatLimit={org?.seatLimit ?? 0}
      seatsUsed={org?.seatsUsed ?? 0}
    />
  );
}
