import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  updatePassword,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import { collections } from '../firebase/schema';
import { mockUsers } from '../data/mockData';

const provider = isFirebaseConfigured ? new GoogleAuthProvider() : null;
const logStage = (stage, payload = {}) => console.log(`[Examify][Auth] ${stage}`, payload);

export const loginWithEmail = async ({ email, password }) => {
  logStage('loginWithEmail:start', { email });
  if (!isFirebaseConfigured) {
    const mockUser = mockUsers[email];
    if (!mockUser) throw new Error('Demo account not found. Try student@example.com, tutor@example.com, or admin@example.com.');
    return { user: mockUser, profile: mockUser, mock: true };
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(credential.user.uid);
  return { user: credential.user, profile };
};

export const registerWithEmail = async ({ fullName, email, password, role, extraProfile = {} }) => {
  logStage('registerWithEmail:start', { email, role });
  const studentDefaults = role === 'student'
    ? {
      previousYearMark: Number(extraProfile.previousYearMark ?? 0),
      latestMark: Number(extraProfile.previousYearMark ?? 0),
      paymentCompleted: false,
      subscriptionStatus: 'pending',
      subject: 'Mathematics',
    }
    : {};

  if (!isFirebaseConfigured) {
    return {
      user: {
        uid: 'demo-new-user',
        email,
        displayName: fullName,
      },
      profile: { uid: 'demo-new-user', email, displayName: fullName, role, ...studentDefaults, ...extraProfile },
      mock: true,
    };
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: fullName });

  const profile = {
    uid: credential.user.uid,
    email,
    displayName: fullName,
    role,
    subject: 'Mathematics',
    createdAt: serverTimestamp(),
    ...studentDefaults,
    ...extraProfile,
  };

  await setDoc(doc(db, collections.users, credential.user.uid), profile);
  return { user: credential.user, profile };
};

export const updateStudentOnboarding = async ({ uid, previousYearMark, sessionType }) => {
  logStage('updateStudentOnboarding:start', { uid, previousYearMark, sessionType });
  if (!isFirebaseConfigured) {
    return { uid, previousYearMark, latestMark: previousYearMark, sessionType, paymentCompleted: false, subscriptionStatus: 'pending' };
  }

  const payload = {
    previousYearMark: Number(previousYearMark),
    latestMark: Number(previousYearMark),
    sessionType,
    paymentCompleted: false,
    subscriptionStatus: 'pending',
    updatedAt: serverTimestamp(),
  };

  await updateDoc(doc(db, collections.users, uid), payload);
  return { uid, ...payload };
};

export const markStudentPaymentComplete = async ({ uid, reference }) => {
  logStage('markStudentPaymentComplete:start', { uid, reference });
  if (!isFirebaseConfigured) {
    return { uid, paymentCompleted: true, subscriptionStatus: 'active', latestPaymentReference: reference };
  }

  const payload = {
    paymentCompleted: true,
    subscriptionStatus: 'active',
    latestPaymentReference: reference,
    updatedAt: serverTimestamp(),
  };

  await updateDoc(doc(db, collections.users, uid), payload);
  return { uid, ...payload };
};

export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured) {
    const mockUser = mockUsers['student@example.com'];
    return { user: mockUser, profile: mockUser, mock: true };
  }

  const credential = await signInWithPopup(auth, provider);
  const profile = await getUserProfile(credential.user.uid);
  return { user: credential.user, profile };
};

export const getUserProfile = async (uid) => {
  if (!isFirebaseConfigured) {
    return Object.values(mockUsers).find((user) => user.uid === uid) ?? null;
  }

  const snapshot = await getDoc(doc(db, collections.users, uid));
  return snapshot.exists() ? snapshot.data() : null;
};

export const logout = async () => {
  if (!isFirebaseConfigured) return true;
  await signOut(auth);
  return true;
};

export const updateUserProfileDetails = async ({ uid, displayName, previousYearMark, newPassword }) => {
  logStage('updateUserProfileDetails:start', { uid });

  if (isFirebaseConfigured && auth?.currentUser) {
    if (displayName) {
      await updateProfile(auth.currentUser, { displayName });
    }
    if (newPassword) {
      await updatePassword(auth.currentUser, newPassword);
    }
    
    const payload = { updatedAt: serverTimestamp() };
    if (displayName) payload.displayName = displayName;
    if (previousYearMark !== undefined && previousYearMark !== null) {
      payload.previousYearMark = Number(previousYearMark);
    }
    
    await updateDoc(doc(db, collections.users, uid), payload);
    return { uid, ...payload };
  } else {
    // Demo mode bypass
    return { uid, displayName, previousYearMark };
  }
};
