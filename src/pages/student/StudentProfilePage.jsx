import { AppShell } from '../../components/common/AppShell';
import { useAuth } from '../../hooks/useAuth';

export const StudentProfilePage = () => {
  const { profile, logout, isDemoMode } = useAuth();

  return (
    <AppShell title="Profile" subtitle="Review your learner profile, tutor assignment context, and environment status." role="student" user={profile} onLogout={logout}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="panel p-5"><p className="text-sm text-slate-500">Name</p><p className="mt-2 text-xl font-semibold text-slate-950">{profile?.displayName}</p></div>
        <div className="panel p-5"><p className="text-sm text-slate-500">Grade</p><p className="mt-2 text-xl font-semibold text-slate-950">{profile?.grade}</p></div>
        <div className="panel p-5"><p className="text-sm text-slate-500">Province</p><p className="mt-2 text-xl font-semibold text-slate-950">{profile?.province}</p></div>
        <div className="panel p-5"><p className="text-sm text-slate-500">Mode</p><p className="mt-2 text-xl font-semibold text-slate-950">{isDemoMode ? 'Demo' : 'Live Firebase'}</p></div>
      </div>
    </AppShell>
  );
};
