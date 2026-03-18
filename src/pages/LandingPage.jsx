import { ArrowRight, BookOpen, BrainCircuit, CheckCircle2, CreditCard, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LandingSection } from '../components/landing/LandingSection';
import { SESSION_PRICING } from '../lib/constants';

const features = [
  {
    title: 'Daily Maths exercises that unlock progressively',
    description: 'Examify assigns up to three exercises per day, but only from tutor-confirmed completed topics. Missed work is locked to preserve the daily rhythm.',
    icon: BookOpen,
  },
  {
    title: 'Peer marking after submission',
    description: 'Students review another learner’s uploaded answer image, score it, and leave comments once their own submission is complete.',
    icon: Users,
  },
  {
    title: 'Tutor-led topic tracking and reports',
    description: 'Tutors control covered topics, write free-text reports, and guide learning with visibility over every student’s progress.',
    icon: ShieldCheck,
  },
  {
    title: 'AI recommendations grounded in real data',
    description: 'Gemini-backed recommendations consider grade, region, covered topics, question papers, tutor notes, and past marks before suggesting exercises.',
    icon: BrainCircuit,
  },
];

const benefits = [
  'Be exam ready.',
  'Question papers focused learning tailored for you.',
];

export const LandingPage = () => (
  <>
    <section className="mx-auto max-w-7xl px-4 pb-24 pt-20 lg:px-6 lg:pt-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-200">
            70-20-10 Maths learning for South African students
          </div>
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-white md:text-6xl">Structured daily Maths practice, guided by tutors and powered by AI.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Examify helps students stay on track with tutor-approved daily exercises, peer marking, paper-based answer uploads, and subscription billing designed around the support they actually need.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/signup" className="btn-primary gap-2">
              Create account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="btn-secondary border-white/20 text-white hover:border-brand-400 hover:text-white">Explore demo accounts</Link>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-accent" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel-dark p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-200">Why it works</p>
          <div className="mt-6 space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-4xl font-bold">70%</p>
              <p className="mt-2 text-lg font-semibold">Daily exercise practice</p>
              <p className="mt-2 text-sm text-slate-300">Only today’s exercise is open, and it is always built from topics the tutor has already marked as completed.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-4xl font-bold">20%</p>
              <p className="mt-2 text-lg font-semibold">Peer marking</p>
              <p className="mt-2 text-sm text-slate-300">Students strengthen reasoning by marking a peer’s uploaded work with comments and marks.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-4xl font-bold">10%</p>
              <p className="mt-2 text-lg font-semibold">Tutor guidance</p>
              <p className="mt-2 text-sm text-slate-300">Tutors track coverage, leave notes, and steer AI recommendations with trusted learning context.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <LandingSection eyebrow="Platform" title="Built for the real Examify workflow" description="The first version goes beyond static screens by wiring the core app flows, backend function structure, and data boundaries needed for production deployment.">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {features.map(({ title, description, icon: Icon }) => (
          <div key={title} className="panel p-6">
            <div className="inline-flex rounded-2xl bg-brand-50 p-3 text-brand-700">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-950">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
          </div>
        ))}
      </div>
    </LandingSection>

    <LandingSection eyebrow="Pricing" title="Subscription guidance based on recent performance" description="Students pay monthly, and Examify calculates the recommended plan from the learner’s latest mark and chosen session type.">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="panel p-6">
          <div className="flex items-center gap-3 text-brand-700">
            <CreditCard className="h-5 w-5" />
            <p className="font-semibold">Session pricing</p>
          </div>
          <ul className="mt-5 space-y-4 text-sm text-slate-600">
            <li className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Online session</span><strong>R{SESSION_PRICING.online.toFixed(2)}</strong></li>
            <li className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>In-person session</span><strong>R{SESSION_PRICING.inPerson.toFixed(2)}</strong></li>
          </ul>
        </div>
        <div className="panel p-6">
          <p className="text-lg font-semibold text-slate-950">Recommended monthly sessions</p>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li>0% to 50% inclusive → 4 sessions</li>
            <li>Above 50% and below 70% inclusive → 2 sessions</li>
            <li>Above 70% → 1 session</li>
          </ul>
        </div>
      </div>
    </LandingSection>
  </>
);
