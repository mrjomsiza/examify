import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

if (!admin.apps.length) {
  admin.initializeApp();
}

const firestoreDatabaseId = process.env.FIRESTORE_DATABASE_ID?.trim() || '(default)';

export const db = firestoreDatabaseId === '(default)' ? getFirestore() : getFirestore(firestoreDatabaseId);
export const storage = admin.storage();
export { admin, firestoreDatabaseId };
