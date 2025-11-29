
import 'server-only';
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc,
  query,
  setDoc,
  getDoc,
  deleteDoc,
  type Firestore,
} from 'firebase/firestore';
import { initializeServerFirebase } from '@/firebase/server-init';
import type { User, CalendarWindow } from './definitions';

// Import initial data from local JSON files
import usersData from './data/users.json';
import windowsData from './data/windows.json';


// --- One-time Data Seeding ---
async function seedFirestore() {
  const { firestore, auth } = initializeServerFirebase();
  const { createUserWithEmailAndPassword } = await import('firebase/auth');

  // Check users
  const usersCollection = collection(firestore, 'users');
  const userSnapshot = await getDocs(query(usersCollection));
  if (userSnapshot.empty) {
    console.log('Seeding users...');
    const batch = writeBatch(firestore);
    
    for (const userData of usersData) {
        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, userData.username, userData.password);
            const user = userCredential.user;

            // Create user profile in Firestore
            const userProfile: Omit<User, 'password'> = {
                id: user.uid,
                username: userData.username,
                role: userData.role as 'admin' | 'user',
            };
            
            const docRef = doc(usersCollection, user.uid);
            batch.set(docRef, userProfile);
             console.log(`User ${userData.username} seeded successfully.`);
        } catch (error: any) {
            // This might fail if the user already exists in Auth from a previous run
            if(error.code === 'auth/email-already-in-use') {
                console.warn(`User with email ${userData.username} already exists in Firebase Auth. Skipping Auth creation.`);
                // We should still try to create the firestore document if it's missing
                const q = query(usersCollection);
                const existingDocs = await getDocs(q);
                const userDoc = existingDocs.docs.find(d => d.data().username === userData.username);

                if (!userDoc) {
                   const docRef = doc(usersCollection);
                   const userProfile: Omit<User, 'password'> = {
                        id: docRef.id,
                        username: userData.username,
                        role: userData.role as 'admin' | 'user',
                    };
                   batch.set(docRef, userProfile);
                }

            } else {
                console.error('Error seeding user:', userData.username, error);
            }
        }
    }
    await batch.commit();
    console.log('Users seeding process finished.');
  }

  // Check windows
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
      }
      batch.set(docRef, newWindow);
    });
    await batch.commit();
    console.log('Advent windows seeded.');
  }
}

// Immediately try to seed data on server startup.
seedFirestore().catch(console.error);


export async function getUsers(db: Firestore): Promise<User[]> {
  const usersCollection = collection(db, 'users');
  const userSnapshot = await getDocs(query(usersCollection));
  const users = userSnapshot.docs.map(doc => doc.data() as User);
  return users;
}

export async function getUser(db: Firestore, id: string): Promise<User | null> {
    const userRef = doc(db, 'users', id);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data() as User;
    }
    return null;
}

export async function getUserRole(userId: string): Promise<string | null> {
    const { firestore } = initializeServerFirebase();
    const user = await getUser(firestore, userId);
    return user?.role || null;
}

export async function setUser(db: Firestore, user: User): Promise<void> {
  const userRef = doc(db, 'users', user.id);
  // Don't save password in the database
  const { password, ...userData } = user;
  await setDoc(userRef, userData);
}

export async function deleteUser(db: Firestore, id: string): Promise<void> {
    const userRef = doc(db, 'users', id);
    await deleteDoc(userRef);
}

export async function getWindows(db: Firestore): Promise<CalendarWindow[]> {
  const windowsCollection = collection(db, 'advent_windows');
  const windowSnapshot = await getDocs(query(windowsCollection));
  const windows = windowSnapshot.docs.map(doc => ({...doc.data(), id: doc.id } as CalendarWindow));
  return windows.sort((a, b) => a.day - b.day);
}

export async function setWindow(db: Firestore, windowItem: CalendarWindow): Promise<void> {
  if (!windowItem.id) throw new Error("Window item must have an ID to be set.");
  const windowRef = doc(db, 'advent_windows', windowItem.id);
  await setDoc(windowRef, windowItem, { merge: true });
}
