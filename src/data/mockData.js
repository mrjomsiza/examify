import { formatISO, subDays, addDays } from 'date-fns';
import { ROLES } from '../lib/constants';

const today = new Date();

export const mockUsers = {
  'student@example.com': {
    uid: 'mock-student-1',
    email: 'student@example.com',
    displayName: 'Naledi Khumalo',
    role: ROLES.STUDENT,
    latestMark: 62,
    sessionType: 'online',
    grade: 'Grade 10',
    province: 'Gauteng',
    tutorId: 'mock-tutor-1',
  },
  'tutor@example.com': {
    uid: 'mock-tutor-1',
    email: 'tutor@example.com',
    displayName: 'Mr. Dlamini',
    role: ROLES.TUTOR,
  },
  'admin@example.com': {
    uid: 'mock-admin-1',
    email: 'admin@example.com',
    displayName: 'Examify Admin',
    role: ROLES.ADMIN,
  },
};

export const mockDashboardData = {
  student: {
    stats: [
      { label: 'Average mark', value: '62%', detail: 'Last 4 exercises' },
      { label: 'Completed topics', value: '8', detail: 'Tutor confirmed' },
      { label: 'Peer reviews', value: '3', detail: 'Awaiting 1' },
      { label: 'Subscription', value: 'Active', detail: 'Renews monthly' },
    ],
    todayExercise: {
      id: 'exercise-today',
      assignmentDate: formatISO(today, { representation: 'date' }),
      title: 'Quadratic factorisation practice',
      sourceLabel: '2023 Gauteng June Paper, Q4.2',
      topic: 'Factorisation of trinomials',
      instruction: 'Answer Q4.2 and show all working on paper before uploading your image.',
    },
    exerciseHistory: [
      {
        id: 'exercise-prev-1',
        assignmentDate: formatISO(subDays(today, 1), { representation: 'date' }),
        title: 'Linear equations word problem',
        topic: 'Linear equations',
        submitted: true,
      },
      {
        id: 'exercise-prev-2',
        assignmentDate: formatISO(subDays(today, 2), { representation: 'date' }),
        title: 'Percentages and ratio revision',
        topic: 'Ratios',
        submitted: false,
      },
      {
        id: 'exercise-next-1',
        assignmentDate: formatISO(addDays(today, 1), { representation: 'date' }),
        title: 'Upcoming simultaneous equations',
        topic: 'Simultaneous equations',
        submitted: false,
      },
    ],
    peerReviewAssignment: {
      id: 'peer-1',
      reviewerId: 'mock-student-1',
      submissionId: 'submission-peer-1',
      studentName: 'Ayanda Molefe',
      prompt: 'Mark correctness, method, and final answer clarity.',
      assignmentDate: formatISO(today, { representation: 'date' }),
      ownSubmissionComplete: true,
      peerReviewSubmitted: false,
    },
    progress: [
      { topic: 'Number patterns', mark: 55 },
      { topic: 'Algebraic expressions', mark: 68 },
      { topic: 'Factorisation', mark: 62 },
      { topic: 'Functions', mark: 71 },
    ],
    feedback: [
      { id: 'fb-1', title: 'Tutor note', message: 'Focus on checking sign changes in factorisation.' },
      { id: 'fb-2', title: 'Peer note', message: 'Good working steps. Watch the final simplification.' },
    ],
  },
  tutor: {
    stats: [
      { label: 'Assigned students', value: '12', detail: 'All Maths only' },
      { label: 'Submissions to review', value: '7', detail: 'Today' },
      { label: 'Question papers', value: '18', detail: 'Published' },
      { label: 'Reports due', value: '4', detail: 'This week' },
    ],
    students: [
      { id: 'mock-student-1', name: 'Naledi Khumalo', grade: 'Grade 10', latestMark: 62, province: 'Gauteng' },
      { id: 'mock-student-2', name: 'Ayanda Molefe', grade: 'Grade 10', latestMark: 48, province: 'Gauteng' },
    ],
    completedTopics: [
      { id: 'ct-1', studentName: 'Naledi Khumalo', topic: 'Factorisation of trinomials', completedOn: '2026-03-12' },
      { id: 'ct-2', studentName: 'Naledi Khumalo', topic: 'Linear equations', completedOn: '2026-03-07' },
    ],
    reports: [
      { id: 'r-1', studentName: 'Naledi Khumalo', note: 'Confidence improving; assign mixed factorisation questions next week.' },
    ],
    questionPapers: [
      { id: 'qp-1', title: 'Grade 10 Gauteng June 2023', year: 2023, term: 'June', region: 'Gauteng' },
    ],
  },
  admin: {
    stats: [
      { label: 'Active students', value: '128', detail: 'Paying subscribers' },
      { label: 'Active tutors', value: '16', detail: 'Maths tutors' },
      { label: 'Monthly revenue', value: '$842', detail: 'Projected' },
      { label: 'Platform alerts', value: '2', detail: 'Require review' },
    ],
    payments: [
      { id: 'pay-1', studentName: 'Naledi Khumalo', amount: '$4.40', status: 'Paid', month: 'March 2026' },
    ],
    tutors: [
      { id: 'mock-tutor-1', name: 'Mr. Dlamini', students: 12, province: 'Gauteng' },
    ],
  },
};
