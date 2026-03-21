import { GuidePage } from '../../components/dashboard/GuidePage';
import { useAuth } from '../../hooks/useAuth';
import { studentGuideQuestions } from '../../lib/guideQuestions';
import { saveGuideAssessmentResult } from '../../services/firestoreService';

const navigationTips = [
  {
    label: 'Start here',
    title: 'Billing keeps your access active',
    description: 'If payment is still pending, open Billing first so your learning access can stay active.',
    destination: 'Billing',
    icon: 'credit',
  },
  {
    label: 'Daily work',
    title: 'Exercises show today\'s approved work',
    description: 'Use the Exercises area to focus on today\'s task and review your assignment timeline.',
    destination: 'Exercises',
    icon: 'route',
  },
  {
    label: 'Uploads',
    title: 'Submit your paper as an image',
    description: 'Complete the work on paper, then upload a clear image when today\'s task is available.',
    destination: 'Overview upload section',
    icon: 'upload',
  },
  {
    label: 'Review',
    title: 'Peer reviews support your feedback loop',
    description: 'Once your own submission is ready, use Peer reviews when a review task is available to you.',
    destination: 'Peer reviews',
    icon: 'review',
  },
];

const flowSteps = [
  {
    title: 'Complete payment if access is pending',
    description: 'Open Billing and confirm your plan details whenever access still shows as pending.',
    hint: 'Billing first when needed',
    shortCheck: 'You know Billing is the first stop whenever payment is still pending.',
    icon: 'credit',
  },
  {
    title: 'Open today\'s exercise',
    description: 'Go to Overview or Exercises and focus on the assignment scheduled for today.',
    hint: 'Today only',
    shortCheck: 'You focus on the current day\'s exercise instead of working ahead.',
    icon: 'route',
  },
  {
    title: 'Write the work on paper and upload your answer image',
    description: 'Finish the Maths work clearly on paper and submit a sharp image when the upload area is available.',
    hint: 'Image upload',
    shortCheck: 'You use image upload rather than typing the solution directly into the app.',
    icon: 'upload',
  },
  {
    title: 'Use feedback and peer review to improve',
    description: 'Check tutor feedback and complete peer review tasks when they appear for you.',
    hint: 'Feedback loop',
    shortCheck: 'You know where feedback and peer-review tasks fit into your learning routine.',
    icon: 'review',
  },
];

export const StudentGuidePage = () => {
  const { profile, logout } = useAuth();

  return (
    <GuidePage
      title="Examify Guide"
      subtitle="Learn the student journey, know what to click, and confirm your understanding with a short guide check."
      role="student"
      user={profile}
      onLogout={logout}
      overview="This guide explains the order a student should follow in Examify so it is easy to know where to go, when work becomes available, and how to submit correctly."
      navigationTips={navigationTips}
      flowSteps={flowSteps}
      questions={studentGuideQuestions}
      onSubmitAssessment={({ answers, score, totalQuestions, percentage }) => saveGuideAssessmentResult({
        userId: profile?.uid,
        userName: profile?.displayName,
        role: 'student',
        guideType: 'student',
        answers,
        score,
        totalQuestions,
        percentage,
      })}
    />
  );
};
