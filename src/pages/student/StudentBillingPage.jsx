import { AppShell } from '../../components/common/AppShell';
import { SectionHeader } from '../../components/common/SectionHeader';
import { useAuth } from '../../hooks/useAuth';
import { getSubscriptionQuote } from '../../services/paymentsService';
import { SESSION_TYPE_LABELS } from '../../lib/constants';

export const StudentBillingPage = () => {
  const { profile, logout } = useAuth();
  const quote = getSubscriptionQuote({ latestMark: profile?.latestMark ?? 0, sessionType: profile?.sessionType ?? 'online' });

  return (
    <AppShell title="Billing" subtitle="Manage subscription logic, recurring payment readiness, and billing context." role="student" user={profile} onLogout={logout}>
      <SectionHeader eyebrow="Subscription" title="Current recommendation" description="Examify calculates the monthly amount from your latest mark and chosen support format." />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5"><p className="text-sm text-slate-500">Session type</p><p className="mt-2 text-2xl font-bold text-slate-950">{SESSION_TYPE_LABELS[quote.sessionType]}</p></div>
        <div className="panel p-5"><p className="text-sm text-slate-500">Recommended sessions</p><p className="mt-2 text-2xl font-bold text-slate-950">{quote.sessionCount}</p></div>
        <div className="panel p-5"><p className="text-sm text-slate-500">Monthly amount</p><p className="mt-2 text-2xl font-bold text-slate-950">R{quote.amount.toFixed(2)}</p></div>
      </div>
      <div className="panel mt-6 p-5 text-sm leading-7 text-slate-600">
        Paystack initialization, verification, authorization storage, and recurring billing structure are implemented in Firebase Functions. Live charges require environment variables and a deployed Firebase project.
      </div>
    </AppShell>
  );
};
