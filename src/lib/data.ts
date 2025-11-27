import 'server-only';
import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  orderBy
} from 'firebase/firestore';

import type { User, CalendarWindow } from './definitions';
import initialUsers from './data/users.json';
import initialWindows from './data/windows.json';

const usersCollection = collection(db, 'users');
const windowsCollection = collection(db, 'windows');

export async function initializeData() {
    console.log("Initializing Firestore with default data...");
    const batch = writeBatch(db);

    // Initialize users
    initialUsers.forEach(user => {
        const userRef = doc(db, "users", user.id);
        batch.set(userRef, user);
    });

    // Initialize windows
    initialWindows.forEach(window => {
        // Firebase document IDs cannot be numbers, so we stringify them.
        const windowRef = doc(db, "windows", String(window.day));
        batch.set(windowRef, window);
    });

    await batch.commit();
    console.log("Firestore initialized successfully.");
}


// --- User Management ---
export async function getUsers(): Promise<User[]> {
    const snapshot = await getDocs(query(usersCollection));
    return snapshot.docs.map(doc => doc.data() as User);
}

export async function findUserByUsername(username: string): Promise<User | undefined> {
    const q = query(usersCollection, where("username", "==", username));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return undefined;
    }
    return snapshot.docs[0].data() as User;
}

export async function addUser(user: Omit<User, 'id' | 'role'>): Promise<User> {
    const newId = String(Date.now());
    const newUser: User = {
        id: newId,
        role: 'user',
        ...user,
    };
    await setDoc(doc(usersCollection, newId), newUser);
    return newUser;
}

export async function deleteUser(id: string): Promise<{ message: string } | null> {
    const userRef = doc(db, 'users', id);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        return { message: "User not found" };
    }
    if ((userDoc.data() as User).role === 'admin') {
        return { message: "Cannot delete admin user" };
    }

    await deleteDoc(userRef);
    return null;
}


// --- Window Management ---
export async function getWindows(): Promise<CalendarWindow[]> {
    const snapshot = await getDocs(query(windowsCollection, orderBy("day")));
    return snapshot.docs.map(doc => doc.data() as CalendarWindow);
}

export async function getWindowByDay(day: number): Promise<CalendarWindow | undefined> {
    const windowRef = doc(db, 'windows', String(day));
    const windowDoc = await getDoc(windowRef);
    if (!windowDoc.exists()) {
        return undefined;
    }
    return windowDoc.data() as CalendarWindow;
}

export async function updateWindow(day: number, data: Partial<Omit<CalendarWindow, 'day'>>): Promise<CalendarWindow | null> {
    const windowRef = doc(db, 'windows', String(day));
    const windowDoc = await getDoc(windowRef);

    if (!windowDoc.exists()) {
        return null;
    }
    
    const existingWindow = windowDoc.data() as CalendarWindow;

    const updatedData = {
        ...data,
        imageHint: data.imageUrl === existingWindow.imageUrl ? existingWindow.imageHint : 'custom image',
    };
    
    // Using setDoc with merge:true is equivalent to an update operation
    await setDoc(windowRef, updatedData, { merge: true });
    
    const newDoc = await getDoc(windowRef);
    return newDoc.data() as CalendarWindow;
}
