import { CalendarDays, Lock, FileText } from 'lucide-react';
import { useState } from 'react';
import { SubmissionUpload } from './SubmissionUpload';
import { uploadSubmissionImage } from '../../services/storageService';
import { canSubmitPeerReview } from '../../utils/exerciseRules';
import { getQuestionPapersByIds } from '../../services/firestoreService';

export const ExerciseCard = ({ exercise, availability, paymentLocked, studentId, dashboard }) => {
  const [openingPapers, setOpeningPapers] = useState(false);

  const handleOpenPapers = async () => {
    if (!exercise?.paperIds?.length) return;
    setOpeningPapers(true);
    try {
      const papers = await getQuestionPapersByIds(exercise.paperIds);
      papers.forEach((paper) => {
        if (paper.paperUrl) {
          window.open(paper.paperUrl, '_blank');
        }
      });
    } catch (error) {
      console.error('Failed to open papers:', error);
    } finally {
      setOpeningPapers(false);
    }
  };

  return (
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
      {exercise?.paperIds?.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={handleOpenPapers}
            disabled={openingPapers}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {openingPapers ? 'Opening...' : 'View Question Papers'}
          </button>
        </div>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        {availability.state === 'active' ? (
          !paymentLocked && exercise ? (
            <SubmissionUpload
              exerciseId={exercise.id}
              onSubmit={({ file, exerciseId }) => uploadSubmissionImage({ file, exerciseId, studentId })}
            />
          ) : (
            <div className="panel flex min-h-56 items-center justify-center p-6 text-center text-sm text-slate-500">
              Uploads unlock only after payment is complete and an exercise has been assigned.
            </div>
          )
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500">
            <Lock className="h-4 w-4" />
            Submission unavailable
          </span>
        )}
      </div>
      <div className="panel space-y-4 p-6 w-full">
        <h3 className="text-xl font-semibold text-slate-950">Feedback loop</h3>
        {(dashboard.feedback ?? []).map((item) => (
          <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">{item.title}</p>
            <p className="mt-2 text-sm text-slate-600">{item.message}</p>
          </div>
        ))}
        <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
          Peer review unlocked: {String(canSubmitPeerReview(dashboard.peerReviewAssignment ?? {}))}
        </div>
      </div>
    </div>
  );
};
