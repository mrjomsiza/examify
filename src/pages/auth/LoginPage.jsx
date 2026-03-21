import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const demoAccounts = [
  { label: 'Student demo', email: 'student@example.com' },
  { label: 'Tutor demo', email: 'tutor@example.com' },
  { label: 'Admin demo', email: 'admin@example.com' },
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginAsDemo, loginWithGoogle, isDemoMode } = useAuth();
  const [form, setForm] = useState({ email: 'student@example.com', password: 'password123' });
  const [status, setStatus] = useState('');

  const redirectByRole = (role) => navigate(`/${role}`);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const result = await login(form);
      redirectByRole(result.profile.role);
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl items-center px-4 py-16 lg:px-6">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="panel-dark p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-200">Access Examify</p>
          <h1 className="mt-4 text-4xl font-bold">Continue learning, teaching, or managing.</h1>
          <p className="mt-4 text-slate-300">Sign in to continue learning, teaching, or managing your Examify workspace.</p>
          <div className="mt-8 space-y-3">
            {demoAccounts.map((account) => (
              <button key={account.email} type="button" onClick={() => loginAsDemo(account.email).then((profile) => redirectByRole(profile.role))} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm hover:border-brand-400/50">
                <span>{account.label}</span>
                <span className="text-slate-400">{account.email}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="panel space-y-5 p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Login</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Welcome back</h2>
          </div>
          <label className="block">
            <span className="label">Email</span>
            <input className="input" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          </label>
          <label className="block">
            <span className="label">Password</span>
            <input type="password" className="input" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
          </label>
          <button type="submit" className="btn-primary w-full">Login</button>
          <button type="button" onClick={() => loginWithGoogle().then((result) => redirectByRole(result.profile.role)).catch((error) => setStatus(error.message))} className="btn-secondary w-full">Continue with Google</button>
          {status ? <p className="text-sm text-rose-600">{status}</p> : null}
          <p className="text-sm text-slate-500">{isDemoMode ? 'Practice access is currently available.' : 'Your account is ready to continue.'}</p>
          <p className="text-sm text-slate-500">Need an account? <Link to="/signup" className="font-semibold text-brand-700">Create one</Link>.</p>
        </form>
      </div>
    </main>
  );
};
