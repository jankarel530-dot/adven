
import 'server-only';
import {
  collection,
  getDocs,
  writeBatch,
  doc,
  query,
  setDoc,
  getDoc,
  deleteDoc,
  where,
  type Firestore,
  addDoc,
} from 'firebase/firestore';
import { initializeServerFirebase } from '@/firebase/server-init';
import type { User, CalendarWindow } from './definitions';

// Import initial data from local JSON files
import usersData from './data/users.json';
import windowsData from './data/windows.json';

// --- One-time Data Seeding ---
async function seedFirestore() {
  const { firestore } = initializeServerFirebase();
  
  // Check users - only seed if the admin user doesn't exist
  const adminUserQuery = query(collection(firestore, 'users'), where('username', '==', 'admin'));
  const adminSnapshot = await getDocs(adminUserQuery);

  if (adminSnapshot.empty) {
    console.log('Seeding users...');
    const batch = writeBatch(firestore);
    usersData.forEach((userData) => {
      // In a real app, you would HASH the password. Here, we're storing it
      // plaintext for simplicity of the non-Firebase-Auth login flow.
      const userRef = doc(firestore, 'users', userData.id); // Use the predefined ID
      batch.set(userRef, { ...userData });
    });
    await batch.commit();
    console.log('Users seeding finished.');
  }

  // Check windows - only seed if collection is empty
  const windowsCollection = collection(firestore, 'advent_windows');
  const windowSnapshot = await getDocs(query(windowsCollection));
  if (windowSnapshot.empty) {
    console.log('Seeding advent_windows...');
    const batch = writeBatch(firestore);
    windowsData.forEach((windowItem) => {
      const docRef = doc(windowsCollection); // Auto-generate ID
      const newWindow: CalendarWindow = {
        ...windowItem,
        id: docRef.id,
        imageHint: windowItem.imageHint || '',
        videoUrl: windowItem.videoUrl || '',
      };
      batch.set(docRef, newWindow);
    });
    await batch.commit();
    console.log('Advent windows seeded.');
  }
}

// Immediately try to seed data on server startup.
seedFirestore().catch(console.error);

// --- User Functions ---

export async function getUsers(db: Firestore): Promise<User[]> {
  const usersCollection = collection(db, 'users');
  const userSnapshot = await getDocs(query(usersCollection));
  return userSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as User));
}

export async function getUser(db: Firestore, id: string): Promise<User | null> {
  const userRef = doc(db, 'users', id);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? (userSnap.data() as User) : null;
}

export async function getUserByUsername(
  db: Firestore,
  username: string
): Promise<User | null> {
  const usersCollection = collection(db, 'users');
  const q = query(usersCollection, where('username', '==', username));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as User;
}

export async function setUser(db: Firestore, user: Omit<User, 'id'>): Promise<string> {
    const usersCollection = collection(db, 'users');
    const docRef = await addDoc(usersCollection, user);
    await setDoc(docRef, { ...user, id: docRef.id }); // Add the ID to the document itself
    return docRef.id;
}


export async function deleteUser(db: Firestore, id: string): Promise<void> {
  const userRef = doc(db, 'users', id);
  await deleteDoc(userRef);
}

// --- Window Functions ---

export async function getWindows(db: Firestore): Promise<CalendarWindow[]> {
  const windowsCollection = collection(db, 'advent_windows');
  const windowSnapshot = await getDocs(query(windowsCollection));
  const windows = windowSnapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as CalendarWindow)
  );
  return windows.sort((a, b) => a.day - b.day);
}

export async function setWindow(
  db: Firestore,
  windowItem: CalendarWindow
): Promise<void> {
  if (!windowItem.id)
    throw new Error('Window item must have an ID to be set.');
  const windowRef = doc(db, 'advent_windows', windowItem.id);
  await setDoc(windowRef, windowItem, { merge: true });
}
