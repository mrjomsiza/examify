import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured, storage } from '../firebase/config';
import { collections } from '../firebase/schema';

export const uploadSubmissionImage = async ({ file, studentId, exerciseId }) => {
  if (!isFirebaseConfigured) {
    return {
      fileName: file?.name ?? 'demo-upload.jpg',
      imageUrl: URL.createObjectURL(file),
      submissionId: 'mock-submission-id',
    };
  }

  const storageRef = ref(storage, `submissions/${studentId}/${exerciseId}/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const imageUrl = await getDownloadURL(storageRef);
  const docRef = await addDoc(collection(db, collections.submissions), {
    studentId,
    exerciseId,
    imageUrl,
    fileName: file.name,
    createdAt: serverTimestamp(),
    status: 'submitted',
  });

  return { fileName: file.name, imageUrl, submissionId: docRef.id };
};
