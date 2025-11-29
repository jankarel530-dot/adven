
import 'client-only';
import {
  doc,
  getDoc,
  type Firestore,
} from 'firebase/firestore';
import type { User } from './definitions';

export async function getUser(db: Firestore, id: string): Promise<User | null> {
  const userRef = doc(db, 'users', id);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    // Check if it's the hardcoded admin user from seeding
    if (id === '1') {
      const adminSnap = await getDoc(doc(db, 'users', '1'));
      return adminSnap.exists() ? (adminSnap.data() as User) : null;
    }
    return null;
  }
  return userSnap.data() as User;
}
