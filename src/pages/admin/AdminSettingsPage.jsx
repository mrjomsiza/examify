import { AppShell } from '../../components/common/AppShell';
import { useAuth } from '../../hooks/useAuth';

export const AdminSettingsPage = () => {
  const { profile, logout } = useAuth();
  return (
    <AppShell title="Platform settings" subtitle="Review platform readiness and important operational settings for Examify." role="admin" user={profile} onLogout={logout}>
      <div className="panel p-5 text-sm text-slate-600">Use this area to review the platform configuration and readiness details needed for ongoing operation.</div>
    </AppShell>
  );
};
