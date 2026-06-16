import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { fetchAuthProfile } from '@/lib/sso';
import { getSiteSettings } from '@/lib/site-settings';
import { getPlanCycle, getBillingWindow, addMonths, formatDate } from '@/lib/billing';
import ProfileCard from './components/profile-card';
import QuickAccess from './components/quick-access';
import UsageStats from './components/usage-stats';
import UpgradeBanner from './components/upgrade-banner';
import InvoiceHistory from './components/invoice-history';
import SubscriptionStatus from './components/subscription-status';
import HelpSupport from './components/help-support';

export default async function MyProfilePage() {
  const headerList = await headers();
  const profile = await fetchAuthProfile(headerList.get('cookie'));

  if (!profile?.user) {
    redirect('/login');
  }

  const settings = await getSiteSettings(['footer']);
  const { user, plan, usage } = profile;

  // Plan Label Logic
  const planLabelMap: Record<string, string> = {
    FREE: 'Free',
    FREE_LOGIN: 'Free',
    UMKM: 'UMKM',
    ENTERPRISE: 'Enterprise',
    MNC: 'MNC',
    BASIC: 'Basic',
    PLUS: 'Plus',
    MAX: 'Max',
  };
  const userPlan = user.plan ?? 'FREE';
  const planLabel = planLabelMap[userPlan] ?? (userPlan);
  const isFree = userPlan === 'FREE' || userPlan === 'FREE_LOGIN';

  // Billing Logic
  const cycle = getPlanCycle(plan ?? null);
  const now = new Date();
  const startDate = user.createdAt ? new Date(user.createdAt) : now;
  const { currentStart, next } = getBillingWindow(startDate, cycle, now);

  // Invoice Generation (Mock logic based on subscription page)
  const invoices: Array<{ id: string; period: string; billedAt: string; status: string; amount: string }> = [];
  const increment = cycle === 'ANNUAL' ? 12 : 1;
  let cursor = new Date(currentStart);
  const planPrice = isFree ? 'Rp 0' : (cycle === 'ANNUAL' ? 'Rp 1.000.000' : 'Rp 100.000'); // Dummy price logic

  for (let i = 0; i < 3; i += 1) {
    const prevStart = addMonths(cursor, -increment);
    if (!isFree && prevStart >= startDate && cursor <= now) {
      invoices.push({
        id: `INV-${cursor.getFullYear()}${String(cursor.getMonth() + 1).padStart(2, '0')}`,
        period: `${formatDate(prevStart)} - ${formatDate(cursor)}`,
        billedAt: formatDate(cursor),
        status: 'Lunas',
        amount: planPrice,
      });
    }
    cursor = prevStart;
  }

  // Usage Stats Logic
  // Ensure limits is Record<string, number | null>
  const limits: Record<string, number | null> = {};
  if (plan?.limits) {
    Object.entries(plan.limits).forEach(([key, value]) => {
      if (typeof value === 'number') {
        limits[key] = value;
      } else {
        limits[key] = null;
      }
    });
  }

  const usageCounts = usage?.counts ?? {};

  return (
    <main className="min-h-screen flex flex-col bg-neutral-light text-text-dark transition-colors duration-300">
      <Navbar />

      <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-8 pt-52 mt-20">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* Left Column (Sidebar) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <ProfileCard user={user} planLabel={planLabel} />
            <QuickAccess />
            <HelpSupport />
          </div>

          {/* Right Column (Main Content) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <UsageStats
              usage={usageCounts}
              limits={limits}
              allowedModels={plan?.allowedModels ?? []}
            />
            <SubscriptionStatus
              planLabel={planLabel}
              status={isFree ? 'Gratis' : 'Aktif'}
              nextBillingDate={isFree ? '-' : formatDate(next)}
              isFree={isFree}
            />
            {isFree && <UpgradeBanner />}
            <InvoiceHistory invoices={invoices} />
          </div>

        </div>
      </div>

      <Footer settings={settings.footer} />
    </main>
  );
}

