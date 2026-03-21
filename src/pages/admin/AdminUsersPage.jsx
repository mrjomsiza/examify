import { useEffect, useState } from 'react';
import { AppShell } from '../../components/common/AppShell';
import { SectionHeader } from '../../components/common/SectionHeader';
import { useAuth } from '../../hooks/useAuth';
import { getUsersForAdmin } from '../../services/firestoreService';

export const AdminUsersPage = () => {
  const { profile, logout } = useAuth();
  const [users, setUsers] = useState({ students: [], tutors: [] });

  useEffect(() => {
    getUsersForAdmin().then(setUsers);
  }, []);

  return (
    <AppShell title="User management" subtitle="Review student and tutor records together with their latest recorded marks." role="admin" user={profile} onLogout={logout}>
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="panel p-6">
          <SectionHeader eyebrow="Students" title="Student list" description="Use this list to review each student and their latest recorded mark." />
          <div className="mt-4 space-y-3">
            {users.students.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">{user.name}</p>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">{user.latestMark}%</span>
              </div>
            ))}
            {!users.students.length ? <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No students are available yet.</div> : null}
          </div>
        </div>

        <div className="panel p-6">
          <SectionHeader eyebrow="Tutors" title="Tutor list" description="Use this list to review each tutor and their recorded mark field." />
          <div className="mt-4 space-y-3">
            {users.tutors.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">{user.name}</p>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">{user.latestMark}%</span>
              </div>
            ))}
            {!users.tutors.length ? <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No tutors are available yet.</div> : null}
          </div>
        </div>
      </section>
    </AppShell>
  );
};
