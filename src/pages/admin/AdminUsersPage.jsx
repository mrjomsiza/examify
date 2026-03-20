import { AppShell } from '../../components/common/AppShell';
import { useAuth } from '../../hooks/useAuth';

export const AdminUsersPage = () => {
  const { profile, logout } = useAuth();
  return (
    <AppShell title="User management" subtitle="This view is ready for live Firestore-backed user administration." role="admin" user={profile} onLogout={logout}>
      <div className="panel p-5 text-sm text-slate-600">Admin user and tutor management hooks are scaffolded through the shared Firestore service layer and can be extended with moderation actions.</div>
    </AppShell>
  );
};
