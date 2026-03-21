import { GuidePage } from '../../components/dashboard/GuidePage';
import { useAuth } from '../../hooks/useAuth';
import { tutorGuideQuestions } from '../../lib/guideQuestions';
import { saveGuideAssessmentResult } from '../../services/firestoreService';

const navigationTips = [
  {
    label: 'Roster',
    title: 'Students helps you see your learners',
    description: 'Open Students to review learner names, grades, provinces, and latest marks.',
    destination: 'Students',
    icon: 'users',
  },
  {
    label: 'Reports',
    title: 'Reports keeps the latest learner note visible',
    description: 'Use Reports and the dashboard report form to keep each learner\'s current learning context up to date.',
    destination: 'Reports',
    icon: 'report',
  },
  {
    label: 'Papers',
    title: 'Past papers support lesson follow-up work',
    description: 'Use the Past papers area to keep suitable paper references available for learner practice.',
    destination: 'Past papers',
    icon: 'guide',
  },
  {
    label: 'Workflow',
    title: 'Overview is where action happens',
    description: 'Use the main dashboard to assign unassigned students, save reports, and complete lessons.',
    destination: 'Overview',
    icon: 'route',
  },
];

const flowSteps = [
  {
    title: 'Add an unassigned student',
    description: 'Start from the tutor overview and add a learner from the unassigned list before managing their work.',
    hint: 'Assign first',
    shortCheck: 'You know a learner must be assigned before you manage reports or lessons for them.',
    icon: 'users',
  },
  {
    title: 'Save the latest learner report',
    description: 'Write a current learner note so the platform always has an up-to-date tutor summary for that student.',
    hint: 'Latest report matters',
    shortCheck: 'You know the latest report is the main written context for the learner.',
    icon: 'report',
  },
  {
    title: 'Mark lessons complete carefully',
    description: 'Capture the topic, lesson report, and understanding level so learner progress stays clear and usable.',
    hint: 'Topic + note + score',
    shortCheck: 'You know every completed lesson needs a topic, lesson note, and understanding score.',
    icon: 'grade',
  },
  {
    title: 'Keep relevant papers available',
    description: 'Maintain matching past papers so students have suitable paper references for practice after lessons.',
    hint: 'Paper support',
    shortCheck: 'You know past papers help support learner practice after completed topics.',
    icon: 'guide',
  },
];

export const TutorGuidePage = () => {
  const { profile, logout } = useAuth();

  return (
    <GuidePage
      title="Examify Guide"
      subtitle="Learn the tutor workflow, follow the right order of actions, and confirm your understanding with a short guide check."
      role="tutor"
      user={profile}
      onLogout={logout}
      overview="This guide explains how tutors should move through learner assignment, reporting, lesson completion, and paper support so the workflow stays consistent."
      navigationTips={navigationTips}
      flowSteps={flowSteps}
      questions={tutorGuideQuestions}
      onSubmitAssessment={({ answers, score, totalQuestions, percentage }) => saveGuideAssessmentResult({
        userId: profile?.uid,
        userName: profile?.displayName,
        role: 'tutor',
        guideType: 'tutor',
        answers,
        score,
        totalQuestions,
        percentage,
      })}
    />
  );
};
