import { AppShell } from '../../components/common/AppShell';
import { useAuth } from '../../hooks/useAuth';

export const AdminSettingsPage = () => {
  const { profile, logout } = useAuth();
  return (
    <AppShell title="Platform settings" subtitle="Environment-aware configuration and operational readiness for Examify." role="admin" user={profile} onLogout={logout}>
      <div className="panel p-5 text-sm text-slate-600">Use the included environment templates and Firebase documentation to configure Gemini, Paystack, and Firebase settings for production deployment.</div>
    </AppShell>
  );
};
