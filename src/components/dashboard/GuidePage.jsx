import { useMemo, useState } from 'react';
import { CheckCircle2, CircleHelp, ClipboardCheck, CreditCard, FileText, GraduationCap, Images, Route, Users } from 'lucide-react';
import { AppShell } from '../common/AppShell';
import { SectionHeader } from '../common/SectionHeader';

const iconMap = {
  credit: CreditCard,
  route: Route,
  upload: Images,
  review: ClipboardCheck,
  users: Users,
  report: FileText,
  guide: CircleHelp,
  grade: GraduationCap,
  check: CheckCircle2,
};

const scoreAnswers = (questions, answers) => questions.reduce((total, question) => (
  answers[question.id] === question.correctAnswer ? total + 1 : total
), 0);

export const GuidePage = ({
  title,
  subtitle,
  role,
  user,
  onLogout,
  overview,
  flowSteps,
  navigationTips,
  questions,
  onSubmitAssessment,
}) => {
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState(null);

  const allAnswered = useMemo(() => questions.every((question) => answers[question.id]), [answers, questions]);

  const handleSubmit = async () => {
    if (!allAnswered) {
      setStatus('Answer every question before submitting the guide check.');
      return;
    }

    const correctAnswers = scoreAnswers(questions, answers);
    const totalQuestions = questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    setIsSaving(true);
    setStatus('');
    try {
      const saved = await onSubmitAssessment({
        answers,
        score: correctAnswers,
        totalQuestions,
        percentage,
      });
      setResult({ correctAnswers, totalQuestions, percentage, saved });
      setStatus('Your answers and score were saved successfully.');
    } catch (error) {
      setStatus(error.message ?? 'Your answers could not be saved yet.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell title={title} subtitle={subtitle} role={role} user={user} onLogout={onLogout}>
      <section className="panel p-6">
        <SectionHeader eyebrow="Guide" title="How Examify works for you" description={overview} />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {navigationTips.map((tip) => {
            const Icon = iconMap[tip.icon] ?? CircleHelp;
            return (
              <div key={tip.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3 text-brand-700">
                  <Icon className="h-5 w-5" />
                  <p className="text-sm font-semibold uppercase tracking-[0.25em]">{tip.label}</p>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950">{tip.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{tip.description}</p>
                <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  Click: <span className="text-brand-700">{tip.destination}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-6">
          <SectionHeader eyebrow="Step by step" title="Recommended flow" description="Follow these steps in order to use the platform smoothly." />
          <div className="mt-6 space-y-4">
            {flowSteps.map((step, index) => {
              const Icon = iconMap[step.icon] ?? CircleHelp;
              return (
                <div key={step.title} className="flex gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-brand-700" />
                      <h3 className="text-lg font-semibold text-slate-950">{step.title}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                    <div className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                      {step.hint}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel p-6">
          <SectionHeader eyebrow="What success looks like" title="Quick visual checklist" description="Use this checklist to confirm you are following the intended journey." />
          <div className="mt-6 space-y-3">
            {flowSteps.map((step) => (
              <div key={step.title} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-slate-950">{step.title}</p>
                  <p className="mt-1">{step.shortCheck}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <SectionHeader eyebrow="Guide check" title="Confirm your understanding" description="Choose the best answer for each question, then submit your score for later review." />
        <div className="mt-6 space-y-5">
          {questions.map((question, index) => (
            <div key={question.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-700">Question {index + 1}</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">{question.question}</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {question.options.map((option) => {
                  const selected = answers[question.id] === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${selected
                        ? 'border-brand-700 bg-brand-50 text-brand-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50/40'}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-3xl bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Ready to submit?</p>
            <p className="mt-1 text-sm text-slate-600">All answers will be saved together with your score once you submit.</p>
            {result ? <p className="mt-2 text-sm font-semibold text-emerald-700">Latest result: {result.correctAnswers}/{result.totalQuestions} ({result.percentage}%)</p> : null}
            {status ? <p className="mt-2 text-sm text-slate-600">{status}</p> : null}
          </div>
          <button type="button" className="btn-primary" disabled={!allAnswered || isSaving} onClick={handleSubmit}>
            {isSaving ? 'Saving results...' : 'Submit guide test'}
          </button>
        </div>
      </section>
    </AppShell>
  );
};
