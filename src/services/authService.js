import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import { collections } from '../firebase/schema';
import { mockUsers } from '../data/mockData';

const provider = isFirebaseConfigured ? new GoogleAuthProvider() : null;

export const loginWithEmail = async ({ email, password }) => {
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
  if (!isFirebaseConfigured) {
    return {
      user: {
        uid: 'demo-new-user',
        email,
        displayName: fullName,
      },
      profile: { uid: 'demo-new-user', email, displayName: fullName, role, ...extraProfile },
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
    ...extraProfile,
  };

  await setDoc(doc(db, collections.users, credential.user.uid), profile);
  return { user: credential.user, profile };
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
