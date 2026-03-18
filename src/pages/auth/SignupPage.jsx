import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SOUTH_AFRICAN_GRADES, REGIONS, ROLES } from '../../lib/constants';
import { useAuth } from '../../hooks/useAuth';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: ROLES.STUDENT,
    grade: SOUTH_AFRICAN_GRADES[0],
    province: REGIONS[0],
  });
  const [status, setStatus] = useState('');

  const handleChange = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const result = await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
        extraProfile: {
          grade: form.role === ROLES.STUDENT ? form.grade : null,
          province: form.role === ROLES.STUDENT ? form.province : null,
        },
      });
      navigate(`/${result.profile.role}`);
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl items-center px-4 py-16 lg:px-6">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="panel-dark p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-200">Set up Examify</p>
          <h1 className="mt-4 text-4xl font-bold">Create a real starter account for the platform.</h1>
          <p className="mt-4 text-slate-300">Student accounts can later activate Paystack subscriptions, tutors manage Maths-only learners, and admins monitor the full platform.</p>
        </div>
        <form onSubmit={handleSubmit} className="panel grid gap-5 p-8 md:grid-cols-2">
          <div className="md:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Signup</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Create your account</h2>
          </div>
          <label>
            <span className="label">Full name</span>
            <input className="input" value={form.fullName} onChange={handleChange('fullName')} required />
          </label>
          <label>
            <span className="label">Email</span>
            <input type="email" className="input" value={form.email} onChange={handleChange('email')} required />
          </label>
          <label>
            <span className="label">Password</span>
            <input type="password" className="input" value={form.password} onChange={handleChange('password')} required minLength={6} />
          </label>
          <label>
            <span className="label">Role</span>
            <select className="input" value={form.role} onChange={handleChange('role')}>
              <option value={ROLES.STUDENT}>Student</option>
              <option value={ROLES.TUTOR}>Tutor</option>
              <option value={ROLES.ADMIN}>Admin</option>
            </select>
          </label>
          {form.role === ROLES.STUDENT ? (
            <>
              <label>
                <span className="label">Grade</span>
                <select className="input" value={form.grade} onChange={handleChange('grade')}>
                  {SOUTH_AFRICAN_GRADES.map((grade) => <option key={grade}>{grade}</option>)}
                </select>
              </label>
              <label>
                <span className="label">Province</span>
                <select className="input" value={form.province} onChange={handleChange('province')}>
                  {REGIONS.map((region) => <option key={region}>{region}</option>)}
                </select>
              </label>
            </>
          ) : null}
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary w-full">Create account</button>
            {status ? <p className="mt-3 text-sm text-rose-600">{status}</p> : null}
            <p className="mt-4 text-sm text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-brand-700">Log in</Link>.</p>
          </div>
        </form>
      </div>
    </main>
  );
};
