import { AppShell } from '../../components/common/AppShell';
import { useAuth } from '../../hooks/useAuth';

export const StudentProfilePage = () => {
  const { profile, logout } = useAuth();

  return (
    <AppShell title="Profile" subtitle="Review your learner profile, tutor assignment details, onboarding mark, and payment state." role="student" user={profile} onLogout={logout}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="panel p-5"><p className="text-sm text-slate-500">Name</p><p className="mt-2 text-xl font-semibold text-slate-950">{profile?.displayName}</p></div>
        <div className="panel p-5"><p className="text-sm text-slate-500">Grade</p><p className="mt-2 text-xl font-semibold text-slate-950">{profile?.grade}</p></div>
        <div className="panel p-5"><p className="text-sm text-slate-500">Province</p><p className="mt-2 text-xl font-semibold text-slate-950">{profile?.province}</p></div>
        <div className="panel p-5"><p className="text-sm text-slate-500">Previous year mark</p><p className="mt-2 text-xl font-semibold text-slate-950">{profile?.previousYearMark ?? 0}%</p></div>
        <div className="panel p-5"><p className="text-sm text-slate-500">Payment state</p><p className="mt-2 text-xl font-semibold text-slate-950">{profile?.paymentCompleted ? 'Paid' : 'Pending'}</p></div>
      </div>
      <div className="panel mt-6 p-5 text-sm text-slate-600">Keep your profile details current so your learning plan and tutor support stay aligned.</div>
    </AppShell>
  );
};
