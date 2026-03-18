import { CalendarDays, Lock, Upload } from 'lucide-react';

export const ExerciseCard = ({ exercise, availability, onUploadClick }) => (
  <div className="panel p-6">
    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
      <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700">
        <CalendarDays className="h-4 w-4" />
        {exercise.assignmentDate}
      </span>
      <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">{availability.label}</span>
    </div>
    <h3 className="mt-4 text-2xl font-bold text-slate-950">{exercise.title}</h3>
    <p className="mt-2 text-sm font-semibold text-accent">{exercise.topic}</p>
    <p className="mt-3 text-sm text-slate-500">{exercise.sourceLabel}</p>
    <p className="mt-4 text-sm leading-7 text-slate-600">{exercise.instruction}</p>
    <div className="mt-6 flex flex-wrap gap-3">
      {availability.state === 'active' ? (
        <button type="button" onClick={onUploadClick} className="btn-primary gap-2">
          <Upload className="h-4 w-4" />
          Upload answer image
        </button>
      ) : (
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500">
          <Lock className="h-4 w-4" />
          Submission unavailable
        </span>
      )}
    </div>
  </div>
);
