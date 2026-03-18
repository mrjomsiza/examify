import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured, storage } from '../firebase/config';
import { collections } from '../firebase/schema';

const logStage = (stage, payload = {}) => console.log(`[Examify][Storage] ${stage}`, payload);

const uploadFile = async ({ file, path }) => {
  const storageRef = ref(storage, `${path}/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const url = await getDownloadURL(storageRef);
  return { fileName: file.name, url };
};

export const uploadSubmissionImage = async ({ file, studentId, exerciseId }) => {
  logStage('uploadSubmissionImage:start', { studentId, exerciseId, fileName: file?.name });
  if (!isFirebaseConfigured) {
    return {
      fileName: file?.name ?? 'demo-upload.jpg',
      imageUrl: URL.createObjectURL(file),
      submissionId: 'mock-submission-id',
    };
  }

  const upload = await uploadFile({ file, path: `submissions/${studentId}/${exerciseId}` });
  const docRef = await addDoc(collection(db, collections.submissions), {
    studentId,
    exerciseId,
    imageUrl: upload.url,
    fileName: upload.fileName,
    createdAt: serverTimestamp(),
    status: 'submitted',
  });

  return { fileName: upload.fileName, imageUrl: upload.url, submissionId: docRef.id };
};

export const uploadQuestionPaperDocuments = async ({ paperFile, memoFile, uploaderId }) => {
  logStage('uploadQuestionPaperDocuments:start', { uploaderId, paper: paperFile?.name, memo: memoFile?.name ?? null });
  if (!isFirebaseConfigured) {
    return {
      paperUrl: paperFile ? URL.createObjectURL(paperFile) : '',
      memoUrl: memoFile ? URL.createObjectURL(memoFile) : '',
      paperFileName: paperFile?.name ?? '',
      memoFileName: memoFile?.name ?? '',
    };
  }

  const paperUpload = paperFile ? await uploadFile({ file: paperFile, path: `questionPapers/${uploaderId}/paper` }) : null;
  const memoUpload = memoFile ? await uploadFile({ file: memoFile, path: `questionPapers/${uploaderId}/memo` }) : null;

  return {
    paperUrl: paperUpload?.url ?? '',
    memoUrl: memoUpload?.url ?? '',
    paperFileName: paperUpload?.fileName ?? '',
    memoFileName: memoUpload?.fileName ?? '',
  };
};
