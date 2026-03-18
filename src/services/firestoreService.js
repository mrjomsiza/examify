import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { collections } from '../firebase/schema';
import { mockDashboardData } from '../data/mockData';

const emptyDashboardData = {
  student: {
    stats: [],
    todayExercise: null,
    exerciseHistory: [],
    peerReviewAssignment: null,
    progress: [],
    feedback: [],
  },
  tutor: {
    stats: [],
    students: [],
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

export const getRoleDashboardData = async (role) => {
  if (!isFirebaseConfigured) return mockDashboardData[role];
  return emptyDashboardData[role] ?? { stats: [] };
};

export const getTodayExercise = async (studentId) => {
  if (!isFirebaseConfigured) return mockDashboardData.student.todayExercise;
  ensureDb();
  const today = new Date().toISOString().slice(0, 10);
  const q = query(
    collection(db, collections.dailyExerciseAssignments),
    where('studentId', '==', studentId),
    where('assignmentDate', '==', today),
    limit(1),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs[0]?.data() ?? null;
};

export const getExerciseHistory = async (studentId) => {
  if (!isFirebaseConfigured) return mockDashboardData.student.exerciseHistory;
  ensureDb();
  const q = query(
    collection(db, collections.dailyExerciseAssignments),
    where('studentId', '==', studentId),
    orderBy('assignmentDate', 'desc'),
    limit(20),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
};

export const saveCoveredTopic = async ({ studentId, tutorId, topic, note }) => {
  if (!isFirebaseConfigured) {
    return { id: 'mock-covered-topic', studentId, tutorId, topic, note, completedOn: new Date().toISOString().slice(0, 10) };
  }
  ensureDb();
  const ref = await addDoc(collection(db, collections.coveredTopics), {
    studentId,
    tutorId,
    topic,
    note,
    completedOn: new Date().toISOString().slice(0, 10),
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, studentId, tutorId, topic, note };
};

export const saveTutorReport = async ({ studentId, tutorId, note }) => {
  if (!isFirebaseConfigured) {
    return { id: 'mock-report', studentId, tutorId, note };
  }
  ensureDb();
  const ref = await addDoc(collection(db, collections.tutorReports), {
    studentId,
    tutorId,
    note,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, studentId, tutorId, note };
};

export const assignStudentToTutor = async ({ studentId, tutorId }) => {
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
    subject: 'Mathematics',
    active: true,
    assignedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, collections.users, studentId), { tutorId });
  return { id: ref.id, studentId, tutorId };
};

export const saveQuestionPaper = async (paper) => {
  if (!isFirebaseConfigured) return { id: 'mock-paper', ...paper };
  ensureDb();
  const ref = await addDoc(collection(db, collections.questionPapers), { ...paper, createdAt: serverTimestamp() });
  return { id: ref.id, ...paper };
};

export const savePeerReview = async (payload) => {
  if (!isFirebaseConfigured) return { id: 'mock-peer-review', ...payload };
  ensureDb();
  const ref = await addDoc(collection(db, collections.peerReviews), { ...payload, createdAt: serverTimestamp() });
  return { id: ref.id, ...payload };
};

export const getSubmissionById = async (submissionId) => {
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
