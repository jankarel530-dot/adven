
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'
import { getUser } from '@/lib/client-data';
import type { User as AppUser } from '@/lib/definitions';


export interface FirebaseContextState {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  authUser: User | null;
  appUser: AppUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsUserLoading(true);
      if (user) {
        setAuthUser(user);
        try {
          const profile = await getUser(firestore, user.uid);
          if (profile) {
            setAppUser(profile);
          } else if(user.isAnonymous) {
            // It's a new anonymous user, we can treat them as a 'user' role by default
            setAppUser({id: user.uid, username: 'anonymous', role: 'user'});
          } else {
            // Logged in with a provider, but no profile yet
            setAppUser(null);
          }
        } catch (e: any) {
           setUserError(e);
           console.error("Failed to fetch user profile:", e);
        }
      } else {
        // No user is signed in, try to sign in anonymously
        signInAnonymously(auth).catch(e => {
            console.error("Anonymous sign-in failed", e);
            setUserError(e);
        });
        setAuthUser(null);
        setAppUser(null);
      }
      setIsUserLoading(false);
    }, (error) => {
        console.error("Auth state change error", error);
        setUserError(error);
        setIsUserLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  const contextValue = useMemo(() => {
    return {
      firebaseApp,
      firestore,
      auth,
      authUser,
      appUser,
      isUserLoading,
      userError,
    };
  }, [firebaseApp, firestore, auth, authUser, appUser, isUserLoading, userError]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};


export const useFirebase = (): FirebaseContextState => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  return context;
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

// This hook provides the authenticated user state.
export const useUser = () => {
    const context = useFirebase();
    return {
        user: context.appUser, // This is our app-specific user profile
        authUser: context.authUser, // This is the raw Firebase auth user
        isUserLoading: context.isUserLoading,
        userError: context.userError,
    };
}

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}
