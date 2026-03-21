import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { addDays, formatISO } from 'date-fns';
import { db, isFirebaseConfigured } from '../firebase/config';
import { collections } from '../firebase/schema';
import {
  mockCompletedLessons,
  mockDashboardData,
  mockQuestionPapers,
  mockTutorReports,
  mockUsers,
} from '../data/mockData';
import { MAX_AI_SOURCE_PAPERS, MAX_DAILY_EXERCISES, SUBJECT, WEEKLY_EXERCISE_DAYS } from '../lib/constants';

const emptyDashboardData = {
  student: {
    stats: [],
    todayExercise: null,
    exerciseHistory: [],
    peerReviewAssignment: null,
    progress: [],
    feedback: [],
    paymentCompleted: false,
    generationStatus: null,
  },
  tutor: {
    stats: [],
    students: [],
    unassignedStudents: [],
    completedTopics: [],
    reports: [],
    questionPapers: [],
  },
  admin: {
    stats: [],
    payments: [],
    tutors: [],
  },
};

const ensureDb = () => {
  if (!db) throw new Error('Firebase is not configured. Add VITE_FIREBASE_* variables to use live data.');
};

const demoUsers = Object.values(mockUsers);

const logStage = (stage, payload = {}) => {
  console.log(`[Examify][Firestore] ${stage}`, payload);
};

const buildStudentGenerationStatus = ({ student, latestReport, availablePapers, paymentCompleted, completedLessons = [] }) => {
  const initialReady = Boolean(student?.previousYearMark && latestReport && availablePapers.length && paymentCompleted);
  const weeklyReady = Boolean(completedLessons.length && availablePapers.length && paymentCompleted);

  return {
    paymentCompleted,
    initial: {
      ready: initialReady,
      checks: {
        previousYearMarkEntered: Boolean(student?.previousYearMark),
        latestTutorReportExists: Boolean(latestReport),
        matchingQuestionPaperExists: availablePapers.length > 0,
        paymentCompleted,
      },
    },
    weekly: {
      ready: weeklyReady,
      checks: {
        lessonCompleted: completedLessons.length > 0,
        matchingQuestionPaperExists: availablePapers.length > 0,
        paymentCompleted,
      },
    },
  };
};

const filterQuestionPapers = (papers, { grade, region, subject = SUBJECT, allowNational = true }) =>
  papers.filter((paper) => {
    const subjectMatches = paper.subject === subject;
    const gradeMatches = !paper.grade || !grade || paper.grade === grade;
    const regionMatches = paper.region === region || (allowNational && paper.region === 'National');
    return subjectMatches && gradeMatches && regionMatches;
  });

const getLatestTutorReportFromList = (studentId, reports) =>
  [...reports]
    .filter((report) => report.studentId === studentId)
    .sort((left, right) => new Date(right.updatedAt ?? right.createdAt ?? 0) - new Date(left.updatedAt ?? left.createdAt ?? 0))[0] ?? null;

const buildRecommendedAssignments = ({ student, completedLessons = [], papers = [], mode }) => {
  const cappedPapers = papers.slice(0, MAX_AI_SOURCE_PAPERS);
  const sourcePaper = cappedPapers[0];
  const lesson = completedLessons[0];

  if (!sourcePaper || !lesson) {
    return [];
  }

  const numberOfExercises = Math.min(MAX_DAILY_EXERCISES, Math.max(1, Math.ceil((11 - (lesson.understandingLevel ?? 5)) / 4)));
  const daysToCreate = mode === 'weekly' ? WEEKLY_EXERCISE_DAYS : 1;

  return Array.from({ length: daysToCreate }, (_, dayIndex) => ({
    studentId: student.uid,
    assignmentDate: formatISO(addDays(new Date(), dayIndex), { representation: 'date' }),
    title: `${lesson.topic} practice set ${dayIndex + 1}`,
    topic: lesson.topic,
    sourceLabel: `${sourcePaper.year} ${sourcePaper.region} ${sourcePaper.month} paper`,
    instruction: `Use ${sourcePaper.month} ${sourcePaper.year} ${sourcePaper.region} paper references for ${numberOfExercises} exercise(s).`,
    subject: SUBJECT,
    generatedBy: 'firebase-ai-logic-workflow',
    paperIds: cappedPapers.map((paper) => paper.id),
    understandingLevel: lesson.understandingLevel ?? null,
    reportSnippet: lesson.topicReport,
  }));
};

const buildTutorDashboard = () => {
  const assignedStudents = demoUsers.filter((user) => user.role === 'student' && user.tutorId === 'mock-tutor-1');
  const unassignedStudents = demoUsers.filter((user) => user.role === 'student' && !user.tutorId);

  return {
    ...mockDashboardData.tutor,
    students: assignedStudents.map((student) => ({
      id: student.uid,
      name: student.displayName,
      grade: student.grade,
      latestMark: student.latestMark,
      province: student.province,
      paymentCompleted: student.paymentCompleted,
    })),
    unassignedStudents: unassignedStudents.map((student) => ({
      id: student.uid,
      name: student.displayName,
      grade: student.grade,
      latestMark: student.latestMark,
      province: student.province,
      paymentCompleted: student.paymentCompleted,
    })),
    reports: mockTutorReports,
    completedTopics: mockCompletedLessons,
    questionPapers: mockQuestionPapers,
    stats: [
      { label: 'Assigned students', value: String(assignedStudents.length), detail: 'All Maths only' },
      { label: 'Unassigned students', value: String(unassignedStudents.length), detail: 'Ready to add' },
      { label: 'Question papers', value: String(mockQuestionPapers.length), detail: 'Published' },
      { label: 'Reports', value: String(mockTutorReports.length), detail: 'Latest editable notes' },
    ],
  };
};

const buildStudentDashboard = (studentId) => {
  const student = demoUsers.find((user) => user.uid === studentId) ?? demoUsers.find((user) => user.role === 'student');
  const availablePapers = filterQuestionPapers(mockQuestionPapers, { grade: student?.grade, region: student?.province });
  const latestReport = getLatestTutorReportFromList(student?.uid, mockTutorReports);
  const generationStatus = buildStudentGenerationStatus({
    student,
    latestReport,
    availablePapers,
    paymentCompleted: Boolean(student?.paymentCompleted),
    completedLessons: mockCompletedLessons.filter((lesson) => lesson.studentId === student?.uid),
  });

  return {
    ...mockDashboardData.student,
    paymentCompleted: Boolean(student?.paymentCompleted),
    generationStatus,
    stats: [
      { label: 'Average mark', value: `${student?.latestMark ?? 0}%`, detail: 'Current learning signal' },
      { label: 'Previous year mark', value: `${student?.previousYearMark ?? 0}%`, detail: 'Entered by student' },
      { label: 'Completed topics', value: String(mockCompletedLessons.filter((lesson) => lesson.studentId === student?.uid).length), detail: 'Tutor confirmed' },
      { label: 'Subscription', value: student?.paymentCompleted ? 'Active' : 'Pending', detail: student?.paymentCompleted ? 'Paid and unlocked' : 'Payment required' },
    ],
  };
};

export const getRoleDashboardData = async (role, options = {}) => {
  logStage('getRoleDashboardData:start', { role, options });
  if (!isFirebaseConfigured) {
    if (role === 'student') return buildStudentDashboard(options.studentId ?? 'mock-student-1');
    if (role === 'tutor') return buildTutorDashboard();
    return mockDashboardData[role];
  }
  return emptyDashboardData[role] ?? { stats: [] };
};

export const getTodayExercise = async (studentId) => {
  logStage('getTodayExercise:start', { studentId });
  if (!isFirebaseConfigured) return buildStudentDashboard(studentId).todayExercise;
  ensureDb();
  const today = new Date().toISOString().slice(0, 10);
  const q = query(
    collection(db, collections.dailyExerciseAssignments),
    where('studentId', '==', studentId),
    where('assignmentDate', '==', today),
    limit(1),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs[0] ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null;
};

export const getExerciseHistory = async (studentId) => {
  logStage('getExerciseHistory:start', { studentId });
  if (!isFirebaseConfigured) return buildStudentDashboard(studentId).exerciseHistory;
  ensureDb();
  const q = query(
    collection(db, collections.dailyExerciseAssignments),
    where('studentId', '==', studentId),
    orderBy('assignmentDate', 'asc'),
    limit(20),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
};

export const getStudentAccessState = async (student) => {
  logStage('getStudentAccessState:start', { studentId: student?.uid });
  if (!student) {
    return {
      paymentCompleted: false,
      paymentRequired: true,
      initialGenerationReady: false,
      weeklyGenerationReady: false,
      matchingQuestionPapers: [],
      latestTutorReport: null,
      completedLessons: [],
      latestGeneratedAssignments: [],
    };
  }

  if (!isFirebaseConfigured) {
    const matchingQuestionPapers = filterQuestionPapers(mockQuestionPapers, { grade: student.grade, region: student.province });
    const latestTutorReport = getLatestTutorReportFromList(student.uid, mockTutorReports);
    const completedLessons = mockCompletedLessons.filter((lesson) => lesson.studentId === student.uid);
    const generationStatus = buildStudentGenerationStatus({
      student,
      latestReport: latestTutorReport,
      availablePapers: matchingQuestionPapers,
      paymentCompleted: Boolean(student.paymentCompleted),
      completedLessons,
    });

    return {
      paymentCompleted: Boolean(student.paymentCompleted),
      paymentRequired: !student.paymentCompleted,
      initialGenerationReady: generationStatus.initial.ready,
      weeklyGenerationReady: generationStatus.weekly.ready,
      generationStatus,
      matchingQuestionPapers: matchingQuestionPapers.slice(0, MAX_AI_SOURCE_PAPERS),
      latestTutorReport,
      completedLessons,
      latestGeneratedAssignments: buildRecommendedAssignments({ student, completedLessons, papers: matchingQuestionPapers, mode: 'weekly' }),
    };
  }

  ensureDb();
  const subscriptionSnapshot = await getDoc(doc(db, collections.subscriptions, student.uid));
  const paymentCompleted = subscriptionSnapshot.exists() ? subscriptionSnapshot.data().status === 'active' : Boolean(student.paymentCompleted);
  const papers = await getQuestionPapers({ grade: student.grade, region: student.province, subject: SUBJECT });
  const reports = await getTutorReports(student.uid);
  const lessons = await getCompletedLessons(student.uid);
  const latestTutorReport = reports[0] ?? null;
  const generationStatus = buildStudentGenerationStatus({
    student,
    latestReport: latestTutorReport,
    availablePapers: papers,
    paymentCompleted,
    completedLessons: lessons,
  });

  return {
    paymentCompleted,
    paymentRequired: !paymentCompleted,
    initialGenerationReady: generationStatus.initial.ready,
    weeklyGenerationReady: generationStatus.weekly.ready,
    generationStatus,
    matchingQuestionPapers: papers.slice(0, MAX_AI_SOURCE_PAPERS),
    latestTutorReport,
    completedLessons: lessons,
    latestGeneratedAssignments: [],
  };
};

export const getUnassignedStudents = async () => {
  logStage('getUnassignedStudents:start');
  if (!isFirebaseConfigured) {
    return demoUsers.filter((user) => user.role === 'student' && !user.tutorId);
  }

  ensureDb();
  const snapshot = await getDocs(query(collection(db, collections.users), where('role', '==', 'student')));
  return snapshot.docs
    .map((item) => item.data())
    .filter((student) => !student.tutorId);
};

export const getAssignedStudentsForTutor = async (tutorId) => {
  logStage('getAssignedStudentsForTutor:start', { tutorId });
  if (!isFirebaseConfigured) {
    return demoUsers.filter((user) => user.role === 'student' && user.tutorId === tutorId);
  }

  ensureDb();
  const snapshot = await getDocs(query(collection(db, collections.users), where('tutorId', '==', tutorId)));
  return snapshot.docs.map((item) => item.data());
};

export const getTutorReports = async (studentId) => {
  logStage('getTutorReports:start', { studentId });
  if (!isFirebaseConfigured) {
    return mockTutorReports
      .filter((report) => !studentId || report.studentId === studentId)
      .sort((left, right) => new Date(right.updatedAt ?? 0) - new Date(left.updatedAt ?? 0));
  }

  ensureDb();
  const constraints = [collection(db, collections.tutorReports)];
  const q = studentId
    ? query(collection(db, collections.tutorReports), where('studentId', '==', studentId), orderBy('updatedAt', 'desc'))
    : query(collection(db, collections.tutorReports), orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
};

export const saveTutorReport = async ({ reportId, studentId, tutorId, note, studentName }) => {
  logStage('saveTutorReport:start', { reportId, studentId, tutorId });
  if (!isFirebaseConfigured) {
    return {
      id: reportId ?? `mock-report-${Date.now()}`,
      studentId,
      tutorId,
      note,
      studentName,
      updatedAt: new Date().toISOString(),
    };
  }

  ensureDb();
  const payload = {
    studentId,
    tutorId,
    note,
    studentName,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  };

  if (reportId) {
    await updateDoc(doc(db, collections.tutorReports, reportId), payload);
    return { id: reportId, ...payload };
  }

  const ref = await addDoc(collection(db, collections.tutorReports), payload);
  return { id: ref.id, ...payload };
};

export const getCompletedLessons = async (studentId) => {
  logStage('getCompletedLessons:start', { studentId });
  if (!isFirebaseConfigured) {
    return mockCompletedLessons.filter((lesson) => !studentId || lesson.studentId === studentId);
  }

  ensureDb();
  const q = studentId
    ? query(collection(db, collections.coveredTopics), where('studentId', '==', studentId), orderBy('completedOn', 'desc'))
    : query(collection(db, collections.coveredTopics), orderBy('completedOn', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
};

export const saveCompletedLesson = async ({ studentId, tutorId, topic, topicReport, understandingLevel, studentName }) => {
  logStage('saveCompletedLesson:start', { studentId, tutorId, topic, understandingLevel });
  if (!isFirebaseConfigured) {
    return {
      id: `mock-lesson-${Date.now()}`,
      studentId,
      tutorId,
      topic,
      topicReport,
      understandingLevel,
      studentName,
      completedOn: new Date().toISOString().slice(0, 10),
    };
  }

  ensureDb();
  const ref = await addDoc(collection(db, collections.coveredTopics), {
    studentId,
    tutorId,
    topic,
    note: topicReport,
    topicReport,
    understandingLevel,
    studentName,
    completedOn: new Date().toISOString().slice(0, 10),
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, studentId, tutorId, topic, topicReport, understandingLevel, studentName };
};

export const assignStudentToTutor = async ({ studentId, tutorId }) => {
  logStage('assignStudentToTutor:start', { studentId, tutorId });
  if (!isFirebaseConfigured) {
    return { id: 'mock-assignment', studentId, tutorId };
  }
  ensureDb();

  const existing = await getDocs(
    query(collection(db, collections.tutorStudentAssignments), where('studentId', '==', studentId), where('active', '==', true), limit(1)),
  );

  if (!existing.empty) {
    throw new Error('This student already has an active Maths tutor assignment.');
  }

  const ref = doc(collection(db, collections.tutorStudentAssignments));
  await setDoc(ref, {
    studentId,
    tutorId,
    subject: SUBJECT,
    active: true,
    assignedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, collections.users, studentId), { tutorId });
  return { id: ref.id, studentId, tutorId };
};

export const getQuestionPapers = async ({ grade, region, subject = SUBJECT } = {}) => {
  logStage('getQuestionPapers:start', { grade, region, subject });
  if (!isFirebaseConfigured) {
    return filterQuestionPapers(mockQuestionPapers, { grade, region, subject, allowNational: true });
  }

  ensureDb();
  const snapshot = await getDocs(query(collection(db, collections.questionPapers), where('subject', '==', subject)));
  return filterQuestionPapers(
    snapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
    { grade, region, subject, allowNational: true },
  );
};

export const getAllQuestionPapers = async () => {
  logStage('getAllQuestionPapers:start');
  if (!isFirebaseConfigured) {
    return mockQuestionPapers;
  }

  ensureDb();
  const snapshot = await getDocs(query(collection(db, collections.questionPapers), orderBy('year', 'desc')));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
};

export const saveQuestionPaper = async (paper) => {
  logStage('saveQuestionPaper:start', paper);
  const existsInDemo = mockQuestionPapers.some((item) =>
    item.region === paper.region && item.subject === paper.subject && item.year === Number(paper.year) && item.month === paper.month,
  );

  if (!isFirebaseConfigured) {
    if (existsInDemo) {
      throw new Error('This past exam paper already exists for the same region, subject, year, and month.');
    }
    return { id: `mock-paper-${Date.now()}`, ...paper };
  }

  ensureDb();
  const duplicateSnapshot = await getDocs(
    query(
      collection(db, collections.questionPapers),
      where('region', '==', paper.region),
      where('subject', '==', paper.subject),
      where('year', '==', Number(paper.year)),
      where('month', '==', paper.month),
      limit(1),
    ),
  );

  if (!duplicateSnapshot.empty) {
    throw new Error('This past exam paper already exists for the same region, subject, year, and month.');
  }

  const ref = await addDoc(collection(db, collections.questionPapers), {
    ...paper,
    year: Number(paper.year),
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...paper };
};

export const savePeerReview = async (payload) => {
  logStage('savePeerReview:start', payload);
  if (!isFirebaseConfigured) return { id: 'mock-peer-review', ...payload };
  ensureDb();
  const ref = await addDoc(collection(db, collections.peerReviews), { ...payload, createdAt: serverTimestamp() });
  return { id: ref.id, ...payload };
};

export const getSubmissionById = async (submissionId) => {
  logStage('getSubmissionById:start', { submissionId });
  if (!isFirebaseConfigured) {
    return {
      id: submissionId,
      studentName: 'Ayanda Molefe',
      imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80',
      exerciseTitle: 'Quadratic factorisation',
    };
  }
  ensureDb();
  const snapshot = await getDoc(doc(db, collections.submissions, submissionId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const generateExercisePlanIfEligible = async ({ student, mode, latestTutorReport, completedLesson, understandingLevel, availablePapers }) => {
  logStage('generateExercisePlanIfEligible:start', { studentId: student?.uid, mode, paperCount: availablePapers?.length ?? 0 });
  const studentState = await getStudentAccessState(student);
  const papers = availablePapers ?? studentState.matchingQuestionPapers;
  const completedLessons = completedLesson ? [completedLesson] : studentState.completedLessons;

  const ready = mode === 'initial' ? studentState.initialGenerationReady : Boolean(studentState.paymentCompleted && completedLessons.length && papers.length);
  if (!ready) {
    return {
      generated: false,
      reason: `Criteria not met for ${mode} generation`,
      criteria: studentState.generationStatus,
      assignments: [],
    };
  }

  const assignments = buildRecommendedAssignments({
    student,
    completedLessons: completedLessons.map((lesson) => ({
      ...lesson,
      topicReport: lesson.topicReport ?? completedLesson?.topicReport ?? latestTutorReport?.note,
      understandingLevel: lesson.understandingLevel ?? understandingLevel ?? 5,
    })),
    papers,
    mode,
  });

  if (!isFirebaseConfigured) {
    return { generated: true, reason: 'Demo generation complete', assignments, criteria: studentState.generationStatus };
  }

  ensureDb();
  const createdAssignments = [];
  for (const assignment of assignments) {
    const existingForDay = await getDocs(query(
      collection(db, collections.dailyExerciseAssignments),
      where('studentId', '==', assignment.studentId),
      where('assignmentDate', '==', assignment.assignmentDate),
      limit(1),
    ));

    if (!existingForDay.empty) {
      console.log('[Examify][Firestore] generateExercisePlanIfEligible:skip-existing', assignment);
      continue;
    }

    const ref = await addDoc(collection(db, collections.dailyExerciseAssignments), {
      ...assignment,
      createdAt: serverTimestamp(),
    });
    createdAssignments.push({ id: ref.id, ...assignment });
  }

  return { generated: createdAssignments.length > 0, reason: `${mode} generation complete`, assignments: createdAssignments, criteria: studentState.generationStatus };
};

export const subscribeToAssignedStudentsForTutor = (tutorId, callback) => {
  if (!isFirebaseConfigured) {
    const demoStudents = demoUsers.filter((user) => user.role === 'student' && user.tutorId === tutorId);
    callback(demoStudents);
    return () => {};
  }
  const q = query(collection(db, collections.users), where('tutorId', '==', tutorId));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(item => item.data()));
  }, (error) => console.error('[Examify][Firestore] subscribeToAssignedStudents error', error));
};

export const subscribeToUnassignedStudents = (callback) => {
  if (!isFirebaseConfigured) {
    const demoStudents = demoUsers.filter((user) => user.role === 'student' && !user.tutorId);
    callback(demoStudents);
    return () => {};
  }
  const q = query(collection(db, collections.users), where('role', '==', 'student'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(item => item.data()).filter(student => !student.tutorId));
  }, (error) => console.error('[Examify][Firestore] subscribeToUnassignedStudents error', error));
};

export const subscribeToUserProfile = (uid, callback) => {
  if (!isFirebaseConfigured) {
    const mockUser = Object.values(mockUsers).find((u) => u.uid === uid);
    callback(mockUser || null);
    return () => {};
  }
  return onSnapshot(doc(db, collections.users, uid), (snapshot) => {
    callback(snapshot.exists() ? snapshot.data() : null);
  }, (error) => console.error('[Examify][Firestore] subscribeToUserProfile error', error));
};
