import { useEffect, useState } from 'react';
import { AppShell } from '../../components/common/AppShell';
import { SectionHeader } from '../../components/common/SectionHeader';
import { StatCard } from '../../components/common/StatCard';
import { useAuth } from '../../hooks/useAuth';
import { assignStudentToTutor, getRoleDashboardData, saveCoveredTopic, saveQuestionPaper, saveTutorReport } from '../../services/firestoreService';
import { REGIONS, TERMS } from '../../lib/constants';

export const TutorDashboardPage = () => {
  const { profile, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    getRoleDashboardData('tutor').then(setDashboard);
  }, []);

  if (!dashboard) return null;

  const students = dashboard.students ?? [];
  const firstStudent = students[0] ?? null;

  return (
    <AppShell title="Tutor dashboard" subtitle="Manage assigned Maths students, track completed topics, write reports, and maintain question papers for AI-backed exercise assignment." role="tutor" user={profile} onLogout={logout}>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(dashboard.stats ?? []).map((item) => <StatCard key={item.label} {...item} />)}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <SectionHeader eyebrow="Students" title="Assigned learners" description="Each student can only have one active Maths tutor assignment at a time." />
          <div className="space-y-4">
            {students.length ? students.map((student) => (
              <div key={student.id} className="panel flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-950">{student.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{student.grade} • {student.province}</p>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={async () => {
                    const result = await assignStudentToTutor({ studentId: student.id, tutorId: profile?.uid });
                    setStatus(`Assignment recorded for ${student.name}: ${result.id}`);
                  }}
                >
                  Ensure assignment
                </button>
              </div>
            )) : <div className="panel p-5 text-sm text-slate-500">No students are assigned to this tutor yet.</div>}
          </div>
        </div>

        <div className="space-y-6">
          <SectionHeader eyebrow="Actions" title="Tutor workflow shortcuts" description="Write student notes, mark topics complete, and upload question paper metadata from one place." />
          <div className="grid gap-4">
            <button className="panel p-5 text-left disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled={!firstStudent} onClick={async () => setStatus(`Covered topic saved: ${(await saveCoveredTopic({ studentId: firstStudent.id, tutorId: profile?.uid, topic: 'Factorisation of trinomials', note: 'Student can expand and factor with moderate support.' })).id}`)}>
              <p className="font-semibold text-slate-950">Mark topic completed</p>
              <p className="mt-2 text-sm text-slate-500">Record tutor-confirmed topic coverage so AI recommendations can use it.</p>
            </button>
            <button className="panel p-5 text-left disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled={!firstStudent} onClick={async () => setStatus(`Report saved: ${(await saveTutorReport({ studentId: firstStudent.id, tutorId: profile?.uid, note: 'Learner should focus on sign accuracy and checking substitutions.' })).id}`)}>
              <p className="font-semibold text-slate-950">Save tutor report</p>
              <p className="mt-2 text-sm text-slate-500">Store the free-text weekly guidance note used later for planning and AI context.</p>
            </button>
            <button className="panel p-5 text-left disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled={!firstStudent} onClick={async () => setStatus(`Question paper saved: ${(await saveQuestionPaper({ subject: 'Mathematics', grade: firstStudent.grade, year: 2026, term: TERMS[1], isNational: false, region: REGIONS[2], notes: 'Algebra-focused drill paper', fileName: 'grade10-june-2026.pdf' })).id}`)}>
              <p className="font-semibold text-slate-950">Save question paper metadata</p>
              <p className="mt-2 text-sm text-slate-500">Use metadata for AI recommendations, filtering, and exercise references.</p>
            </button>
          </div>
          {!firstStudent ? <div className="panel p-4 text-sm text-slate-500">Assign at least one student before using tutor quick actions.</div> : null}
          {status ? <div className="panel p-4 text-sm text-slate-600">{status}</div> : null}
        </div>
      </section>
    </AppShell>
  );
};
