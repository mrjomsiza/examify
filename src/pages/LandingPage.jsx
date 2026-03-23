import { ArrowRight, BookOpen, BrainCircuit, CheckCircle2, ShieldCheck, Users } from 'lucide-react';
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
      {/* ================= HERO ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-20 lg:px-6 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          
          {/* LEFT */}
          <div className="panel-dark p-8 md:p-10 backdrop-blur-xl border-white/20 shadow-[0_20px_50px_-5px_rgba(0,0,0,0.5)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-200">
              70-20-10 Maths learning for South African students
            </div>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-white md:text-6xl drop-shadow-lg">
              Structured daily Maths practice, guided by tutors and powered by AI.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 drop-shadow">
              Examify helps students stay on track with tutor-approved daily exercises, peer marking, paper-based answer uploads, and subscription billing designed around the support they actually need.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/signup" className="btn-primary gap-2">
                Create account
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link to="/login" className="btn-secondary border-white/20 text-white hover:border-brand-400 hover:text-white">
                Explore demo accounts
              </Link>
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

          {/* RIGHT (3D CARDS) */}
          <div className="relative flex flex-col items-start justify-center pt-8 pb-32 lg:pb-0 lg:pl-10 min-h-[500px]">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-brand-200">
              Teaching Method
            </p>

            <div className="absolute inset-0 rounded-full mt-1 bg-brand-500/20 blur-[100px]" />

            <div className="relative w-full max-w-sm">
              <div className="absolute top-0 w-full rounded-3xl border border-white/30 bg-white/10 p-6 backdrop-blur-xl">
                <p className="text-5xl font-extrabold text-white">70%</p>
                <p className="mt-2 text-xl font-bold text-white">Daily exercise</p>
              </div>

              <div className="absolute top-[140px] right-0 w-11/12 rounded-3xl border border-brand-400/40 bg-brand-900/60 p-6">
                <p className="text-4xl font-bold text-white">20%</p>
                <p className="mt-2 text-lg font-bold text-white">Peer marking</p>
              </div>

              <div className="absolute top-[280px] left-0 w-10/12 rounded-3xl border border-slate-700/50 bg-slate-950/70 p-6">
                <p className="text-4xl font-bold text-white">10%</p>
                <p className="mt-2 text-lg font-bold text-white">Tutor guidance</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <LandingSection
        eyebrow="Platform"
        title="Built for the real Examify workflow"
        description="The first version goes beyond static screens by wiring the core app flows, backend function structure, and data boundaries needed for production deployment."
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ title, description, icon: Icon }) => (
            <div key={title} className="panel p-6 hover:-translate-y-2 transition">
              <Icon className="h-6 w-6 text-brand-700" />
              <h3 className="mt-4 text-xl font-semibold text-slate-950">{title}</h3>
              <p className="mt-3 text-sm text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </LandingSection>

      {/* ================= PRICING ================= */}
      <LandingSection
        eyebrow="Pricing"
        title="Payment guidelines."
        description="Students pay monthly via online payments."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="panel p-6">
            <p className="font-semibold text-slate-950">Session pricing</p>
            <p className="text-slate-600 mt-2">Online: R{SESSION_PRICING.online}</p>
            <p className="text-slate-600">In-person: R{SESSION_PRICING.inPerson}</p>
          </div>

          <div className="panel p-6">
            <p className="font-semibold text-slate-950">Recommended sessions</p>
            <p className="text-slate-600 mt-2"> Below 70% → 4 sessions</p>
            <p className="text-slate-600"> 70% and above → 2 sessions</p>
          </div>
        </div>
      </LandingSection>

      {/* ================= FOOTER ================= */}
      <footer className="mt-24 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6 grid gap-10 md:grid-cols-3">

          {/* LOGO + DESC */}
          <div>
            <h2 className="text-2xl font-bold text-white">Examify</h2>
            <p className="mt-3 text-sm text-slate-400">
              Structured learning powered by tutors and AI. Helping students become exam ready.
            </p>
          </div>

          {/* LINKS */}
          <div>
            <p className="font-semibold text-white">Policies</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><Link to="/policies#terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link to="/policies#privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/policies#refunds" className="hover:text-white">Refund Policy</Link></li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <p className="font-semibold text-white">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>Email: bakayise.developers@gmail.com</li>
              <li>Examify</li>
              <li>South Africa</li>
            </ul>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Examify. All rights reserved.
        </div>
      </footer>
    </>
  );
};