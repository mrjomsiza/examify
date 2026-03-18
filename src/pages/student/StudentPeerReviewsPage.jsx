import { useEffect, useState } from 'react';
import { AppShell } from '../../components/common/AppShell';
import { PeerReviewForm } from '../../components/dashboard/PeerReviewForm';
import { useAuth } from '../../hooks/useAuth';
import { getRoleDashboardData, getSubmissionById, savePeerReview } from '../../services/firestoreService';
import { canSubmitPeerReview } from '../../utils/exerciseRules';

export const StudentPeerReviewsPage = () => {
  const { profile, logout } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await getRoleDashboardData('student');
      setAssignment(data.peerReviewAssignment);
      const result = await getSubmissionById(data.peerReviewAssignment.submissionId);
      setSubmission(result);
    };
    load();
  }, []);

  return (
    <AppShell title="Peer reviews" subtitle="Review a classmate’s uploaded Maths answer after you have submitted your own work." role="student" user={profile} onLogout={logout}>
      <PeerReviewForm
        submission={submission}
        canReview={canSubmitPeerReview(assignment ?? {})}
        onSubmit={(payload) =>
          savePeerReview({
            ...payload,
            reviewerId: profile?.uid,
            submissionId: assignment?.submissionId,
            assignmentDate: assignment?.assignmentDate,
          })
        }
      />
    </AppShell>
  );
};
