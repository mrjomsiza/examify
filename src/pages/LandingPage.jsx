import { ArrowRight, BookOpen, BrainCircuit, CheckCircle2, CreditCard, ShieldCheck, Users } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { LandingSection } from '../components/landing/LandingSection';
import { SESSION_PRICING } from '../lib/constants';
import { useAuth } from '../hooks/useAuth';

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

export const LandingPage = () => {
  const { profile } = useAuth();

  if (profile?.role) return <Navigate to={`/${profile.role}`} replace />;

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-20 lg:px-6 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="panel-dark p-8 md:p-10 backdrop-blur-xl border-white/20 shadow-[0_20px_50px_-5px_rgba(0,0,0,0.5)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-200">
            70-20-10 Maths learning for South African students
          </div>
            <h1 className="mt-6 text-5xl font-bold tracking-tight text-white md:text-6xl drop-shadow-lg">Structured daily Maths practice, guided by tutors and powered by AI.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 drop-shadow">
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
        <div className="perspective-1000 relative flex flex-col items-center justify-center pt-8 pb-32 lg:pb-0 lg:pl-10 min-h-[500px]">
          {/* TEACHING METHOD EYEBROW */}
          <div className="w-full text-center lg:text-left mb-12 z-40">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-200 drop-shadow-md">Teaching Method</p>
          </div>

          {/* Main 3D background glow */}
          <div className="animate-glow absolute inset-0 rounded-full mt-12 bg-brand-500/20 mix-blend-screen blur-[100px]" />
          
          <div className="preserve-3d relative w-full max-w-sm h-full">
            {/* 70% Card */}
            <div className="animate-float-fast absolute top-0 left-0 z-30 w-full rounded-3xl border border-white/30 bg-white/10 p-6 backdrop-blur-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]">
              <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 drop-shadow-2xl">70%</p>
              <p className="mt-2 text-xl font-bold text-white shadow-black drop-shadow-lg">Daily exercise</p>
              <p className="mt-2 text-sm text-white/80 leading-relaxed font-medium">Only today’s exercise is open, built exclusively from topics the tutor confirmed.</p>
            </div>

            {/* 20% Card */}
            <div className="animate-float-medium absolute top-[140px] -right-4 lg:-right-8 z-20 w-11/12 rounded-3xl border border-brand-400/40 bg-brand-900/60 p-6 backdrop-blur-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]">
              <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-100 drop-shadow-xl">20%</p>
              <p className="mt-2 text-lg font-bold text-white drop-shadow-md">Peer marking</p>
              <p className="mt-2 text-sm text-brand-100/90 leading-relaxed">Strengthen reasoning by marking a peer’s uploaded work with absolute focus.</p>
            </div>

            {/* 10% Card */}
            <div className="animate-float-slow absolute top-[280px] -left-2 lg:-left-6 z-10 w-10/12 rounded-3xl border border-slate-700/50 bg-slate-950/70 p-6 backdrop-blur-md shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)]">
              <p className="text-4xl font-extrabold text-slate-300 drop-shadow-lg">10%</p>
              <p className="mt-2 text-lg font-bold text-white drop-shadow-md">Tutor guidance</p>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">Tutors track coverage, leave notes, and naturally steer AI recommendations.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <LandingSection eyebrow="Platform" title="Built for the real Examify workflow" description="The first version goes beyond static screens by wiring the core app flows, backend function structure, and data boundaries needed for production deployment.">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {features.map(({ title, description, icon: Icon }) => (
          <div key={title} className="panel p-6 transition-all duration-300 hover:-translate-y-2 hover:-translate-x-1 hover:shadow-[10px_10px_0px_rgba(37,99,235,0.15)] bg-gradient-to-br hover:from-white hover:to-slate-50">
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
};
