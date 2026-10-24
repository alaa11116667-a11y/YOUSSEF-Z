import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  AppStateData,
  RegisteredStudent,
  Exam,
  ExamSubmission,
  Homework,
  PdfDocument,
  EngineerProblem,
  EngineerSubmission,
  BoardCapture,
  Announcement,
  Complaint
} from '../types';
import { initialData } from '../data/initialData';

// Firestore collection mappings
export const COLLECTIONS = {
  STUDENTS: 'students',
  EXAMS: 'exams',
  SUBMISSIONS: 'submissions',
  HOMEWORKS: 'homeworks',
  PDFS: 'pdfs',
  ENGINEER_PROBLEMS: 'engineer_problems',
  ENGINEER_SUBMISSIONS: 'engineer_submissions',
  BOARD_CAPTURES: 'board_captures',
  ANNOUNCEMENTS: 'announcements',
  COMPLAINTS: 'complaints'
} as const;

/**
 * Seed initial physics data to Firestore if cloud collections are empty
 */
export async function seedInitialCloudDataIfNeeded(): Promise<void> {
  try {
    const examsSnapshot = await getDocs(collection(db, COLLECTIONS.EXAMS));
    if (!examsSnapshot.empty) {
      // Cloud is already populated
      return;
    }

    console.log('Seeding initial physics platform data to Cloud Firestore...');
    const batch = writeBatch(db);

    // Seed Exams
    initialData.exams.forEach((exam) => {
      batch.set(doc(db, COLLECTIONS.EXAMS, exam.id), exam);
    });

    // Seed Homeworks
    initialData.homeworks.forEach((hw) => {
      batch.set(doc(db, COLLECTIONS.HOMEWORKS, hw.id), hw);
    });

    // Seed PDFs
    initialData.pdfs.forEach((pdf) => {
      batch.set(doc(db, COLLECTIONS.PDFS, pdf.id), pdf);
    });

    // Seed Engineer Problems
    initialData.engineerProblems.forEach((prob) => {
      batch.set(doc(db, COLLECTIONS.ENGINEER_PROBLEMS, prob.id), prob);
    });

    // Seed Board Captures
    initialData.boardCaptures.forEach((board) => {
      batch.set(doc(db, COLLECTIONS.BOARD_CAPTURES, board.id), board);
    });

    // Seed Announcements
    initialData.announcements.forEach((ann) => {
      batch.set(doc(db, COLLECTIONS.ANNOUNCEMENTS, ann.id), ann);
    });

    await batch.commit();
    console.log('Initial physics data successfully seeded to Cloud Firestore.');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seedInitialCloudData');
  }
}

/**
 * Subscribe to real-time changes across all cloud collections
 */
export function subscribeToCloudData(
  onUpdate: (updater: (prev: AppStateData) => AppStateData) => void,
  onConnected?: () => void
): () => void {
  const unsubscribers: (() => void)[] = [];
  let isConnectedNotified = false;

  const notifyConnected = () => {
    if (!isConnectedNotified) {
      isConnectedNotified = true;
      onConnected?.();
    }
  };

  try {
    // 1. Registered Students
    const unsubStudents = onSnapshot(
      collection(db, COLLECTIONS.STUDENTS),
      (snapshot) => {
        notifyConnected();
        const students: RegisteredStudent[] = snapshot.docs.map((d) => d.data() as RegisteredStudent);
        onUpdate((prev) => ({ ...prev, students }));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, COLLECTIONS.STUDENTS)
    );
    unsubscribers.push(unsubStudents);

    // 2. Exams
    const unsubExams = onSnapshot(
      collection(db, COLLECTIONS.EXAMS),
      (snapshot) => {
        notifyConnected();
        if (!snapshot.empty) {
          const exams: Exam[] = snapshot.docs.map((d) => d.data() as Exam);
          onUpdate((prev) => ({ ...prev, exams }));
        }
      },
      (error) => handleFirestoreError(error, OperationType.LIST, COLLECTIONS.EXAMS)
    );
    unsubscribers.push(unsubExams);

    // 3. Submissions (Student exams & teacher corrections)
    const unsubSubmissions = onSnapshot(
      collection(db, COLLECTIONS.SUBMISSIONS),
      (snapshot) => {
        notifyConnected();
        const submissions: ExamSubmission[] = snapshot.docs.map((d) => d.data() as ExamSubmission);
        onUpdate((prev) => ({ ...prev, submissions }));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, COLLECTIONS.SUBMISSIONS)
    );
    unsubscribers.push(unsubSubmissions);

    // 4. Homeworks
    const unsubHomeworks = onSnapshot(
      collection(db, COLLECTIONS.HOMEWORKS),
      (snapshot) => {
        notifyConnected();
        if (!snapshot.empty) {
          const homeworks: Homework[] = snapshot.docs.map((d) => d.data() as Homework);
          onUpdate((prev) => ({ ...prev, homeworks }));
        }
      },
      (error) => handleFirestoreError(error, OperationType.LIST, COLLECTIONS.HOMEWORKS)
    );
    unsubscribers.push(unsubHomeworks);

    // 5. PDFs
    const unsubPdfs = onSnapshot(
      collection(db, COLLECTIONS.PDFS),
      (snapshot) => {
        notifyConnected();
        if (!snapshot.empty) {
          const pdfs: PdfDocument[] = snapshot.docs.map((d) => d.data() as PdfDocument);
          onUpdate((prev) => ({ ...prev, pdfs }));
        }
      },
      (error) => handleFirestoreError(error, OperationType.LIST, COLLECTIONS.PDFS)
    );
    unsubscribers.push(unsubPdfs);

    // 6. Engineer Problems
    const unsubProblems = onSnapshot(
      collection(db, COLLECTIONS.ENGINEER_PROBLEMS),
      (snapshot) => {
        notifyConnected();
        if (!snapshot.empty) {
          const engineerProblems: EngineerProblem[] = snapshot.docs.map(
            (d) => d.data() as EngineerProblem
          );
          onUpdate((prev) => ({ ...prev, engineerProblems }));
        }
      },
      (error) => handleFirestoreError(error, OperationType.LIST, COLLECTIONS.ENGINEER_PROBLEMS)
    );
    unsubscribers.push(unsubProblems);

    // 7. Engineer Submissions (Solutions submitted by students for teacher grading)
    const unsubEngSubs = onSnapshot(
      collection(db, COLLECTIONS.ENGINEER_SUBMISSIONS),
      (snapshot) => {
        notifyConnected();
        const engineerSubmissions: EngineerSubmission[] = snapshot.docs.map(
          (d) => d.data() as EngineerSubmission
        );
        onUpdate((prev) => ({ ...prev, engineerSubmissions }));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, COLLECTIONS.ENGINEER_SUBMISSIONS)
    );
    unsubscribers.push(unsubEngSubs);

    // 8. Board Captures
    const unsubBoards = onSnapshot(
      collection(db, COLLECTIONS.BOARD_CAPTURES),
      (snapshot) => {
        notifyConnected();
        if (!snapshot.empty) {
          const boardCaptures: BoardCapture[] = snapshot.docs.map((d) => d.data() as BoardCapture);
          onUpdate((prev) => ({ ...prev, boardCaptures }));
        }
      },
      (error) => handleFirestoreError(error, OperationType.LIST, COLLECTIONS.BOARD_CAPTURES)
    );
    unsubscribers.push(unsubBoards);

    // 9. Complaints
    const unsubComplaints = onSnapshot(
      collection(db, COLLECTIONS.COMPLAINTS),
      (snapshot) => {
        notifyConnected();
        const complaints: Complaint[] = snapshot.docs.map((d) => d.data() as Complaint);
        onUpdate((prev) => ({ ...prev, complaints }));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, COLLECTIONS.COMPLAINTS)
    );
    unsubscribers.push(unsubComplaints);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'globalSubscriptions');
  }

  return () => {
    unsubscribers.forEach((unsub) => {
      try {
        unsub();
      } catch (e) {
        console.error('Error unsubscribing', e);
      }
    });
  };
}

/**
 * Save / Update an item in Cloud Firestore
 */
export async function syncItemToCloud<T extends { id: string }>(
  collectionName: string,
  item: T
): Promise<void> {
  try {
    let payload = item;
    const str = JSON.stringify(item);
    if (str.length > 950000) {
      console.warn(
        `Payload for ${collectionName}/${item.id} is ${str.length} bytes, which exceeds Firestore 1MB document limit. Safely adapting attachment.`
      );
      const copy: any = { ...item };
      if (copy.downloadUrl && copy.downloadUrl.length > 500000) {
        copy.downloadUrl = '#stored_attachment';
      }
      payload = copy;
    }
    await setDoc(doc(db, collectionName, item.id), payload, { merge: true });
    console.log(`Cloud sync success: [${collectionName}/${item.id}]`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${item.id}`);
  }
}

/**
 * Remove an item from Cloud Firestore
 */
export async function deleteItemFromCloud(
  collectionName: string,
  itemId: string
): Promise<void> {
  try {
    await deleteDoc(doc(db, collectionName, itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${itemId}`);
  }
}
