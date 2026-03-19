import { useMemo, useState } from 'react';
import { AppShell } from '../../components/common/AppShell';
import { SectionHeader } from '../../components/common/SectionHeader';
import { useAuth } from '../../hooks/useAuth';
import { generateExercisePlanIfEligible, getStudentAccessState } from '../../services/firestoreService';
import { getSubscriptionQuote, initializeSubscriptionPayment } from '../../services/paymentsService';
import { SESSION_TYPE_LABELS } from '../../lib/constants';

export const StudentBillingPage = () => {
  const { profile, logout, markStudentPaymentComplete, refreshProfile, isDemoMode } = useAuth();
  const [status, setStatus] = useState('');
  const [accessState, setAccessState] = useState(null);
  const quote = useMemo(
    () => getSubscriptionQuote({ latestMark: profile?.latestMark ?? profile?.previousYearMark ?? 0, sessionType: profile?.sessionType ?? 'online' }),
    [profile],
  );

  const refreshAccess = async () => {
    const snapshot = await getStudentAccessState(profile);
    setAccessState(snapshot);
    return snapshot;
  };

  const handlePaymentStart = async () => {
    console.log('[Examify][Billing] payment:start', { studentId: profile?.uid });
    const result = await initializeSubscriptionPayment({
      email: profile?.email,
      studentId: profile?.uid,
      latestMark: profile?.latestMark ?? profile?.previousYearMark,
      sessionType: profile?.sessionType ?? 'online',
    });
    setStatus(`Payment initialized with reference ${result.reference}. Use the callback flow or the testing button below after successful payment.`);
  };

  const handlePaymentComplete = async () => {
    console.log('[Examify][Billing] payment:complete', { studentId: profile?.uid });
    const updated = await markStudentPaymentComplete({ uid: profile?.uid, reference: `manual-${Date.now()}` });
    await refreshProfile(profile?.uid);
    const snapshot = await refreshAccess();

    if (snapshot.initialGenerationReady) {
      const generation = await generateExercisePlanIfEligible({ student: { ...profile, ...updated }, mode: 'initial' });
      console.log('[Examify][Billing] initialGeneration', generation);
      setStatus(`Payment recorded. Initial exercise generation ${generation.generated ? 'ran successfully' : 'is waiting for remaining criteria'}.`);
    } else {
      setStatus('Payment recorded. Initial exercise generation is still waiting for the remaining criteria.');
    }
  };

  return (
    <AppShell title="Billing" subtitle="Manage subscription logic, payment completion, and the exercise-unlock workflow." role="student" user={profile} onLogout={logout}>
      <SectionHeader eyebrow="Subscription" title="Current recommendation" description="Examify calculates the monthly amount from the student-entered previous year mark until fresh learning data is available." />
      <div className="grid gap-4 md:grid-cols-4">
        <div className="panel p-5"><p className="text-sm text-slate-500">Session type</p><p className="mt-2 text-2xl font-bold text-slate-950">{SESSION_TYPE_LABELS[quote.sessionType]}</p></div>
        <div className="panel p-5"><p className="text-sm text-slate-500">Previous year mark</p><p className="mt-2 text-2xl font-bold text-slate-950">{profile?.previousYearMark ?? 0}%</p></div>
        <div className="panel p-5"><p className="text-sm text-slate-500">Recommended sessions</p><p className="mt-2 text-2xl font-bold text-slate-950">{quote.sessionCount}</p></div>
        <div className="panel p-5"><p className="text-sm text-slate-500">Monthly amount</p><p className="mt-2 text-2xl font-bold text-slate-950">R{quote.amount.toFixed(2)}</p></div>
      </div>
      <div className="panel mt-6 space-y-4 p-5 text-sm leading-7 text-slate-600">
        <p>Students are sent here immediately after signup. Lessons and exercises remain locked until payment is completed.</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={handlePaymentStart}>Initialize payment</button>
          <button type="button" className="btn-secondary" onClick={handlePaymentComplete}>Mark payment complete for testing</button>
          <button type="button" className="btn-secondary" onClick={refreshAccess}>Refresh access checks</button>
        </div>
        {accessState ? (
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">Access checks</p>
            <p className="mt-2">Payment completed: {String(accessState.paymentCompleted)}</p>
            <p>Initial generation ready: {String(accessState.initialGenerationReady)}</p>
            <p>Weekly generation ready: {String(accessState.weeklyGenerationReady)}</p>
          </div>
        ) : null}
        {status ? <p>{status}</p> : null}
        <p>{isDemoMode ? 'Demo mode is active. Use the testing button to simulate payment completion.' : 'Live mode is active. Use Paystack and then complete verification/update status flow.'}</p>
      </div>
    </AppShell>
  );
};
