import { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { AppShell } from '../../components/common/AppShell';
import { SectionHeader } from '../../components/common/SectionHeader';
import { StatCard } from '../../components/common/StatCard';
import { ExerciseCard } from '../../components/dashboard/ExerciseCard';
import { SubmissionUpload } from '../../components/dashboard/SubmissionUpload';
import { useAuth } from '../../hooks/useAuth';
import { getExerciseAvailability, canOpenExercise, canSubmitPeerReview } from '../../utils/exerciseRules';
import { getExerciseHistory, getRoleDashboardData } from '../../services/firestoreService';
import { uploadSubmissionImage } from '../../services/storageService';
import { getSubscriptionQuote, initializeSubscriptionPayment } from '../../services/paymentsService';
import { recommendExercises } from '../../services/aiService';

export const StudentDashboardPage = () => {
  const { profile, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [history, setHistory] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRoleDashboardData('student');
        setDashboard(data);
        const exerciseHistory = await getExerciseHistory(profile?.uid);
        setHistory(exerciseHistory);
        const ai = await recommendExercises({
          studentId: profile?.uid,
          grade: profile?.grade,
          region: profile?.province,
          latestMark: profile?.latestMark,
        });
        setAiRecommendations(ai.recommendations ?? []);
        setLoadError('');
      } catch (error) {
        console.error('Student dashboard load error:', error);
        setDashboard((current) => current ?? { stats: [], todayExercise: null, feedback: [], peerReviewAssignment: null });
        setHistory([]);
        setAiRecommendations([]);
        setLoadError('Some student dashboard data could not be loaded yet. Check Firebase setup and seeded records.');
      }
    };

    load();
  }, [profile]);

  const todayExercise = dashboard?.todayExercise;
  const quote = useMemo(
    () => getSubscriptionQuote({ latestMark: profile?.latestMark ?? 0, sessionType: profile?.sessionType ?? 'online' }),
    [profile],
  );

  if (!dashboard) return null;

  const availability = todayExercise ? getExerciseAvailability(todayExercise.assignmentDate, false) : null;

  return (
    <AppShell
      title="Student dashboard"
      subtitle="Follow today’s approved Maths exercise, upload handwritten work, complete peer review tasks, and keep billing aligned with your latest performance."
      role="student"
      user={profile}
      onLogout={logout}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(dashboard.stats ?? []).map((item) => <StatCard key={item.label} {...item} />)}
      </section>

      {loadError ? <div className="panel p-4 text-sm text-amber-700">{loadError}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {todayExercise && availability ? (
          <ExerciseCard exercise={todayExercise} availability={availability} onUploadClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} />
        ) : (
          <div className="panel flex min-h-72 items-center justify-center p-6 text-center text-sm text-slate-500">
            No exercise has been assigned for today yet. Once tutor-approved work is scheduled, it will appear here.
          </div>
        )}
        <div className="panel p-6">
          <div className="flex items-center gap-3 text-brand-700">
            <Sparkles className="h-5 w-5" />
            <h3 className="text-xl font-semibold text-slate-950">AI-backed next recommendations</h3>
          </div>
          <p className="mt-3 text-sm text-slate-500">Gemini only recommends exercises grounded in tutor-completed topics, recent marks, region, and question-paper metadata.</p>
          <div className="mt-5 space-y-4">
            {aiRecommendations.map((item) => (
              <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">{item.title}</p>
                <p className="mt-1 text-sm text-accent">{item.topic}</p>
                <p className="mt-2 text-sm text-slate-500">{item.reason}</p>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.25em] text-slate-400">{item.sourceLabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <SectionHeader eyebrow="History" title="Exercise history" description="Past exercises remain visible for reference. Missed work is locked, and tomorrow’s exercises stay unavailable." />
          <div className="space-y-4">
            {history.map((exercise) => {
              const itemAvailability = getExerciseAvailability(exercise.assignmentDate, exercise.submitted);
              return (
                <div key={exercise.id} className="panel flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-950">{exercise.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{exercise.topic}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-400">{exercise.assignmentDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700">{itemAvailability.label}</p>
                    <p className="mt-1 text-xs text-slate-400">{canOpenExercise(exercise.assignmentDate) ? 'Open today' : 'Reference only'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <SectionHeader eyebrow="Billing" title="Subscription guidance" description="Plan pricing is derived from your latest mark and selected session type." />
          <div className="panel space-y-4 p-6">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
              <span>Session type</span>
              <strong>{profile?.sessionType ?? 'online'}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
              <span>Recommended sessions</span>
              <strong>{quote.sessionCount} / month</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
              <span>Estimated amount</span>
              <strong>R{quote.amount.toFixed(2)}</strong>
            </div>
            <button
              type="button"
              className="btn-primary w-full"
              onClick={async () => {
                const result = await initializeSubscriptionPayment({
                  email: profile?.email,
                  studentId: profile?.uid,
                  latestMark: profile?.latestMark,
                  sessionType: profile?.sessionType ?? 'online',
                });
                setPaymentStatus(`Payment initialized with reference ${result.reference}. Redirect URL: ${result.authorizationUrl}`);
              }}
            >
              Start or renew subscription
            </button>
            {paymentStatus ? <p className="text-sm text-slate-500">{paymentStatus}</p> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {todayExercise ? (
          <SubmissionUpload
            exerciseId={todayExercise.id}
            onSubmit={({ file, exerciseId }) => uploadSubmissionImage({ file, exerciseId, studentId: profile?.uid })}
          />
        ) : (
          <div className="panel flex min-h-56 items-center justify-center p-6 text-center text-sm text-slate-500">
            Uploads will unlock once today’s exercise has been assigned.
          </div>
        )}
        <div className="panel space-y-4 p-6">
          <h3 className="text-xl font-semibold text-slate-950">Feedback loop</h3>
          {(dashboard.feedback ?? []).map((item) => (
            <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm text-slate-600">{item.message}</p>
            </div>
          ))}
          <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            Peer review unlocked: {String(canSubmitPeerReview(dashboard.peerReviewAssignment ?? {}))}
          </div>
        </div>
      </section>
    </AppShell>
  );
};
