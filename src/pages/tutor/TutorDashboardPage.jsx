import { useEffect, useState } from 'react';
import { AppShell } from '../../components/common/AppShell';
import { SectionHeader } from '../../components/common/SectionHeader';
import { StatCard } from '../../components/common/StatCard';
import { useAuth } from '../../hooks/useAuth';
import {
  assignStudentToTutor,
  generateExercisePlanIfEligible,
  getQuestionPapers,
  getRoleDashboardData,
  getTutorReports,
  saveCompletedLesson,
  saveTutorReport,
  subscribeToAssignedStudentsForTutor,
  subscribeToUnassignedStudents,
} from '../../services/firestoreService';

export const TutorDashboardPage = () => {
  const { profile, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [students, setStudents] = useState([]);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [status, setStatus] = useState('');
  const [reportForm, setReportForm] = useState({ studentId: '', reportId: '', note: '' });
  const [lessonForm, setLessonForm] = useState({ studentId: '', topic: '', topicReport: '', understandingLevel: 5 });

  const loadDashboard = async () => {
    console.log('[Examify][TutorDashboard] load:start', { tutorId: profile?.uid });
    const data = await getRoleDashboardData('tutor', { tutorId: profile?.uid });
    setDashboard(data);
  };

  useEffect(() => {
    loadDashboard();
    
    if (profile?.uid) {
      const unsub1 = subscribeToAssignedStudentsForTutor(profile.uid, (data) => {
        setStudents(data);
        if (data[0]) {
          setReportForm((current) => current.studentId ? current : { ...current, studentId: data[0].uid || data[0].id });
          setLessonForm((current) => current.studentId ? current : { ...current, studentId: data[0].uid || data[0].id });
        }
      });
      const unsub2 = subscribeToUnassignedStudents(setUnassignedStudents);
      return () => { unsub1(); unsub2(); };
    }
  }, [profile?.uid]);

  if (!dashboard) return null;

  const selectedStudent = students.find((student) => (student.uid || student.id) === reportForm.studentId) ?? students[0] ?? null;

  const handleAssignStudent = async (studentId) => {
    console.log('[Examify][TutorDashboard] assignStudent:start', { studentId, tutorId: profile?.uid });
    try {
      const result = await assignStudentToTutor({ studentId, tutorId: profile?.uid });
      console.log('[Examify][TutorDashboard] assignStudent:success', result);
      setStatus('Student assigned successfully. You can now write a report and complete lessons for that student.');
      await loadDashboard();
    } catch (error) {
      console.error('[Examify][TutorDashboard] assignStudent:error', error);
      setStatus(error.message);
    }
  };

  const handleSaveReport = async () => {
    if (!selectedStudent) {
      setStatus('Assign a student first before saving a report.');
      return;
    }

    console.log('[Examify][TutorDashboard] saveReport:start', reportForm);
    const existingReports = await getTutorReports(selectedStudent.id);
    const latestReport = existingReports[0] ?? null;
    const result = await saveTutorReport({
      reportId: latestReport?.id ?? reportForm.reportId,
      studentId: selectedStudent.id,
      tutorId: profile?.uid,
      studentName: selectedStudent.name,
      note: reportForm.note,
    });
    console.log('[Examify][TutorDashboard] saveReport:success', result);
    setStatus('Tutor report saved. The latest report will be used for AI exercise generation.');
    await loadDashboard();
  };

  const handleCompleteLesson = async () => {
    if (!selectedStudent) {
      setStatus('Assign a student first before marking a lesson complete.');
      return;
    }

    console.log('[Examify][TutorDashboard] completeLesson:start', lessonForm);
    const lesson = await saveCompletedLesson({
      studentId: selectedStudent.id,
      tutorId: profile?.uid,
      studentName: selectedStudent.name,
      topic: lessonForm.topic,
      topicReport: lessonForm.topicReport,
      understandingLevel: Number(lessonForm.understandingLevel),
    });

    const availablePapers = await getQuestionPapers({ grade: selectedStudent.grade, region: selectedStudent.province, subject: 'Mathematics' });
    const generation = await generateExercisePlanIfEligible({
      student: {
        uid: selectedStudent.id,
        grade: selectedStudent.grade,
        province: selectedStudent.province,
        paymentCompleted: selectedStudent.paymentCompleted,
      },
      mode: 'weekly',
      completedLesson: lesson,
      understandingLevel: Number(lessonForm.understandingLevel),
      availablePapers,
    });

    console.log('[Examify][TutorDashboard] completeLesson:generation', generation);
    setStatus(generation.generated
      ? 'Lesson saved and weekly exercise generation was triggered successfully.'
      : 'Lesson saved, but weekly generation is still waiting for payment or matching papers.');
    setLessonForm((current) => ({ ...current, topic: '', topicReport: '', understandingLevel: 5 }));
    await loadDashboard();
  };

  return (
    <AppShell title="Tutor dashboard" subtitle="Add unassigned students, keep the latest editable report, complete lessons with understanding scores, and trigger weekly AI generation." role="tutor" user={profile} onLogout={logout}>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(dashboard.stats ?? []).map((item) => <StatCard key={item.label} {...item} />)}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <SectionHeader eyebrow="Students" title="Assigned learners" description="Tutors must add students manually from the unassigned pool before reports and lessons can be managed." />
          <div className="space-y-4">
            {students.length ? students.map((student) => (
              <div key={student.uid || student.id} className="panel p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{student.displayName || student.name || 'Student'}</p>
                    <p className="mt-1 text-sm text-slate-500">{student.grade || '?'} • {student.province || '?'}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${student.paymentCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {student.paymentCompleted ? 'paid' : 'unpaid'}
                  </span>
                </div>
              </div>
            )) : <div className="panel p-5 text-sm text-slate-500">No students are assigned to this tutor yet.</div>}
          </div>
        </div>

        <div className="space-y-6">
          <SectionHeader eyebrow="Add student" title="Unassigned students" description="Only students without a Maths tutor appear here." />
          <div className="space-y-4">
            {unassignedStudents.length ? unassignedStudents.map((student) => (
              <div key={student.uid || student.id} className="panel flex items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-semibold text-slate-950">{student.displayName || student.name || 'Student'}</p>
                  <p className="mt-1 text-sm text-slate-500">{student.grade || '?'} • {student.province || '?'}</p>
                </div>
                <button type="button" className="btn-primary" onClick={() => handleAssignStudent(student.uid || student.id)}>Add student</button>
              </div>
            )) : <div className="panel p-5 text-sm text-slate-500">There are no unassigned students right now.</div>}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="panel space-y-4 p-6">
          <SectionHeader eyebrow="Latest report" title="Student capability report" description="Reports are editable and the latest report is always what AI uses during generation." />
          <select className="input" value={reportForm.studentId} onChange={(event) => {
            setReportForm((current) => ({ ...current, studentId: event.target.value }));
            setLessonForm((current) => ({ ...current, studentId: event.target.value }));
          }}>
            <option value="">Select assigned student</option>
            {students.map((student) => <option key={student.uid || student.id} value={student.uid || student.id}>{student.displayName || student.name || 'Student'}</option>)}
          </select>
          <textarea className="input min-h-40" value={reportForm.note} onChange={(event) => setReportForm((current) => ({ ...current, note: event.target.value }))} placeholder="Explain the student's capabilities, weaknesses, and readiness." />
          <button type="button" className="btn-primary" onClick={handleSaveReport} disabled={!selectedStudent}>Save latest report</button>
        </div>

        <div className="panel space-y-4 p-6">
          <SectionHeader eyebrow="Lesson complete" title="Complete topic and trigger weekly generation" description="When a lesson is marked complete, provide the topic, the lesson report, and understanding level from 0 to 10." />
          <input className="input" value={lessonForm.topic} onChange={(event) => setLessonForm((current) => ({ ...current, topic: event.target.value }))} placeholder="Topic name covered" />
          <textarea className="input min-h-32" value={lessonForm.topicReport} onChange={(event) => setLessonForm((current) => ({ ...current, topicReport: event.target.value }))} placeholder="Topic-specific report for the student" />
          <label>
            <span className="label">Understanding level (0 - 10)</span>
            <input type="number" min="0" max="10" className="input" value={lessonForm.understandingLevel} onChange={(event) => setLessonForm((current) => ({ ...current, understandingLevel: event.target.value }))} />
          </label>
          <button type="button" className="btn-primary" onClick={handleCompleteLesson} disabled={!selectedStudent || !lessonForm.topic}>Mark lesson complete</button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="panel p-6">
          <SectionHeader eyebrow="Reports" title="Latest tutor reports" description="The latest report is what the weekly AI logic should use." />
          <div className="mt-4 space-y-3">
            {(dashboard.reports ?? []).map((report) => (
              <div key={report.id} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">{report.studentName}</p>
                <p className="mt-2 text-sm text-slate-600">{report.note}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-6">
          <SectionHeader eyebrow="Completed lessons" title="Topic readiness" description="Understanding scores flow into the weekly exercise generation logic." />
          <div className="mt-4 space-y-3">
            {(dashboard.completedTopics ?? []).map((lesson) => (
              <div key={lesson.id} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">{lesson.topic}</p>
                <p className="mt-1 text-sm text-slate-500">Understanding: {lesson.understandingLevel}/10</p>
                <p className="mt-2 text-sm text-slate-600">{lesson.topicReport ?? lesson.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {status ? <div className="panel p-4 text-sm text-slate-700">{status}</div> : null}
    </AppShell>
  );
};
