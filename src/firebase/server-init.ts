import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

type FirebaseServices = {
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
};

// IMPORTANT: This function is only for server-side use.
export function initializeServerFirebase(): FirebaseServices {
  if (!getApps().length) {
    const firebaseApp = initializeApp(firebaseConfig);
    return {
        firebaseApp,
        auth: getAuth(firebaseApp),
        firestore: getFirestore(firebaseApp),
    };
  }

  const firebaseApp = getApp();
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
  };
}
