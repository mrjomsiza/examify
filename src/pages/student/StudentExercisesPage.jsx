import { useEffect, useState } from 'react';
import { AppShell } from '../../components/common/AppShell';
import { SectionHeader } from '../../components/common/SectionHeader';
import { useAuth } from '../../hooks/useAuth';
import { getExerciseHistory, getTodayExercise } from '../../services/firestoreService';
import { getExerciseAvailability } from '../../utils/exerciseRules';

export const StudentExercisesPage = () => {
  const { profile, logout } = useAuth();
  const [todayExercise, setTodayExercise] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getTodayExercise(profile?.uid).then(setTodayExercise);
    getExerciseHistory(profile?.uid).then(setHistory);
  }, [profile]);

  return (
    <AppShell title="Exercises" subtitle="Review today’s task and browse your Maths assignment timeline." role="student" user={profile} onLogout={logout}>
      <SectionHeader eyebrow="Today" title={todayExercise?.title ?? 'Loading…'} description={todayExercise?.instruction} />
      <div className="grid gap-4">
        {history.map((exercise) => {
          const availability = getExerciseAvailability(exercise.assignmentDate, exercise.submitted);
          return (
            <div key={exercise.id} className="panel flex items-center justify-between p-5">
              <div>
                <p className="font-semibold text-slate-950">{exercise.title}</p>
                <p className="mt-1 text-sm text-slate-500">{exercise.assignmentDate}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">{availability.label}</span>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
};
