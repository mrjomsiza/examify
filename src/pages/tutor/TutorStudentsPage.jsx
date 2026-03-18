import { useEffect, useState } from 'react';
import { AppShell } from '../../components/common/AppShell';
import { SectionHeader } from '../../components/common/SectionHeader';
import { useAuth } from '../../hooks/useAuth';
import { getRoleDashboardData } from '../../services/firestoreService';

export const TutorStudentsPage = () => {
  const { profile, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    getRoleDashboardData('tutor').then(setDashboard);
  }, []);

  return (
    <AppShell title="Students" subtitle="See assigned learner performance and tutor-owned context." role="tutor" user={profile} onLogout={logout}>
      <SectionHeader eyebrow="Roster" title="Tutor students" description="Students stay scoped to their assigned tutor in the dashboard experience." />
      <div className="grid gap-4">
        {dashboard?.students.map((student) => (
          <div key={student.id} className="panel p-5">
            <p className="text-lg font-semibold text-slate-950">{student.name}</p>
            <p className="mt-1 text-sm text-slate-500">{student.grade} • {student.province}</p>
            <p className="mt-3 text-sm text-slate-600">Latest mark: {student.latestMark}%</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
};
