import { useEffect, useState } from 'react';
import { AppShell } from '../../components/common/AppShell';
import { SectionHeader } from '../../components/common/SectionHeader';
import { useAuth } from '../../hooks/useAuth';
import { getRoleDashboardData } from '../../services/firestoreService';

export const TutorReportsPage = () => {
  const { profile, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    getRoleDashboardData('tutor').then(setDashboard);
  }, []);

  return (
    <AppShell title="Reports" subtitle="Review the latest learner notes and keep tutor guidance easy to update." role="tutor" user={profile} onLogout={logout}>
      <SectionHeader eyebrow="Guidance" title="Recent tutor notes" description="Use recent notes to stay aligned on learner progress and next steps." />
      <div className="grid gap-4">
        {(dashboard?.reports ?? []).map((report) => (
          <div key={report.id} className="panel p-5">
            <p className="font-semibold text-slate-950">{report.studentName}</p>
            <p className="mt-3 text-sm text-slate-600">{report.note}</p>
          </div>
        ))}
        {!dashboard?.reports?.length ? <div className="panel p-5 text-sm text-slate-500">No tutor reports have been created yet.</div> : null}
      </div>
    </AppShell>
  );
};
