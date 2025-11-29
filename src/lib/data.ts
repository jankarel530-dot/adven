import 'server-only';
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc,
  query,
  setDoc,
} from 'firebase/firestore';
import { initializeServerFirebase } from '@/firebase/server-init';
import type { User, CalendarWindow } from './definitions';

// Import initial data from local JSON files
import usersData from './data/users.json';
import windowsData from './data/windows.json';

// --- Firebase Admin SDK Initialization ---
// The `initializeServerFirebase` function handles the server-side initialization
// when called in a server-only environment.
const { firestore } = initializeServerFirebase();

// --- One-time Data Seeding ---
async function seedFirestore() {
  // Check users
  const usersCollection = collection(firestore, 'users');
  const userSnapshot = await getDocs(query(usersCollection));
  if (userSnapshot.empty) {
    console.log('Seeding users...');
    const batch = writeBatch(firestore);
    usersData.forEach((user) => {
      const docRef = doc(usersCollection, user.id);
      batch.set(docRef, user);
    });
    await batch.commit();
    console.log('Users seeded.');
  }

  // Check windows
  const windowsCollection = collection(firestore, 'advent_windows');
  const windowSnapshot = await getDocs(query(windowsCollection));
  if (windowSnapshot.empty) {
    console.log('Seeding advent_windows...');
    const batch = writeBatch(firestore);
    windowsData.forEach((windowItem) => {
      const docRef = doc(windowsCollection); // Auto-generate ID
      batch.set(docRef, { ...windowItem, id: docRef.id }); // Add the generated ID to the document
    });
    await batch.commit();
    console.log('Advent windows seeded.');
  }
}

// Immediately try to seed data on server startup.
// Using a top-level await is fine in modern Node.js modules.
seedFirestore().catch(console.error);
// --- End of Seeding ---


export async function getUsers(): Promise<User[]> {
  const usersCollection = collection(firestore, 'users');
  const userSnapshot = await getDocs(query(usersCollection));
  const users = userSnapshot.docs.map(doc => doc.data() as User);
  return users;
}

export async function setUser(user: User): Promise<void> {
  const userRef = doc(firestore, 'users', user.id);
  await setDoc(userRef, user);
}

export async function deleteUser(id: string): Promise<void> {
    const usersCollection = collection(firestore, 'users');
    const userSnapshot = await getDocs(query(usersCollection));
    const userDoc = userSnapshot.docs.find(d => d.id === id);
    if (userDoc) {
      await writeBatch(firestore).delete(userDoc.ref).commit();
    } else {
      throw new Error("User not found");
    }
}

export async function getWindows(): Promise<CalendarWindow[]> {
  const windowsCollection = collection(firestore, 'advent_windows');
  const windowSnapshot = await getDocs(query(windowsCollection));
  const windows = windowSnapshot.docs.map(doc => ({...doc.data(), id: doc.id } as CalendarWindow));
  return windows.sort((a, b) => a.day - b.day);
}

export async function setWindow(windowItem: CalendarWindow): Promise<void> {
  if (!windowItem.id) throw new Error("Window item must have an ID to be set.");
  const windowRef = doc(firestore, 'advent_windows', windowItem.id);
  await setDoc(windowRef, windowItem, { merge: true });
}
