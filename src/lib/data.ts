import 'server-only';
import { db } from './firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import type { User, CalendarWindow } from './definitions';
import initialUsers from './data/users.json';
import initialWindows from './data/windows.json';

const usersCollection = collection(db, 'users');
const windowsCollection = collection(db, 'windows');

// --- Initialization ---
export async function initializeData() {
  const usersSnapshot = await getDocs(usersCollection);
  const windowsSnapshot = await getDocs(windowsCollection);

  const batch = writeBatch(db);
  let operationsCount = 0;

  if (usersSnapshot.empty) {
    console.log('Initializing users collection...');
    initialUsers.forEach(user => {
      // We don't specify an ID, so Firestore generates one.
      const userRef = doc(usersCollection);
      batch.set(userRef, user);
      operationsCount++;
    });
  }

  if (windowsSnapshot.empty) {
    console.log('Initializing windows collection...');
    initialWindows.forEach(windowData => {
      // Use 'day' as the document ID for windows for easy lookup.
      const windowRef = doc(db, 'windows', String(windowData.day));
      batch.set(windowRef, windowData);
      operationsCount++;
    });
  }

  if (operationsCount > 0) {
    await batch.commit();
    console.log('Firestore initialized successfully.');
    return { message: 'Firestore initialized successfully.' };
  }

  return { message: 'Firestore already contains data. No action taken.' };
}


// --- User Management ---
export async function getUsers(): Promise<User[]> {
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

export async function findUserByUsername(
  username: string
): Promise<User | undefined> {
  const q = query(usersCollection, where('username', '==', username));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return undefined;
  }
  const userDoc = snapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() } as User;
}

export async function addUser(user: Omit<User, 'id' | 'role'>): Promise<User> {
  const newUser = {
    ...user,
    role: 'user',
  };
  const docRef = await addDoc(usersCollection, newUser);
  return { id: docRef.id, ...newUser };
}

export async function deleteUser(
  id: string
): Promise<{ message: string } | null> {
  const userRef = doc(db, 'users', id);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    return { message: 'User not found' };
  }

  if (userDoc.data().role === 'admin') {
    return { message: 'Cannot delete admin user' };
  }

  await deleteDoc(userRef);
  return null;
}

// --- Window Management ---
export async function getWindows(): Promise<CalendarWindow[]> {
  const snapshot = await getDocs(windowsCollection);
  const windows = snapshot.docs.map(doc => doc.data() as CalendarWindow);
  // Sort by day just in case Firestore doesn't return them in order
  windows.sort((a, b) => a.day - b.day);
  return windows;
}

export async function getWindowByDay(
  day: number
): Promise<CalendarWindow | undefined> {
  const windowRef = doc(db, 'windows', String(day));
  const docSnap = await getDoc(windowRef);
  if (docSnap.exists()) {
    return docSnap.data() as CalendarWindow;
  }
  return undefined;
}

export async function updateWindow(
  day: number,
  data: Partial<Omit<CalendarWindow, 'day'>>
): Promise<CalendarWindow | null> {
  const windowRef = doc(db, 'windows', String(day));
  await updateDoc(windowRef, data);
  
  const updatedDoc = await getDoc(windowRef);
  if (updatedDoc.exists()) {
    return updatedDoc.data() as CalendarWindow;
  }
  return null;
}
