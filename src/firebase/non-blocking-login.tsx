'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getSdks } from '.';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

const createProfile = (user: any) => {
    const { firestore } = getSdks(user.app);
    const userProfileRef = doc(firestore, 'users', user.uid, 'profile');
    const profileData = {
        id: user.uid,
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ')[1] || '',
        username: user.email?.split('@')[0] || '',
        profilePicture: user.photoURL || '',
        totalPoints: 0
    };

    setDoc(userProfileRef, profileData, { merge: true }).catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: userProfileRef.path,
            operation: 'write', 
            requestResourceData: profileData,
          })
        )
      });
}


/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
    createUserWithEmailAndPassword(authInstance, email, password)
    .then(credential => {
        createProfile(credential.user);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate Google sign-in (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): void {
    const provider = new GoogleAuthProvider();
    signInWithPopup(authInstance, provider)
    .then(credential => {
        // Check if this is a new user
        const firestore = getSdks(authInstance.app).firestore;
        const userProfileRef = doc(firestore, 'users', credential.user.uid, 'profile');
        
        // A simple way to check for new user is to try to get their profile
        // A more robust way would be to check metadata, but this is fine for now
        // This is not a perfect check, but good enough for this context
        if (credential.user.metadata.creationTime === credential.user.metadata.lastSignInTime) {
            createProfile(credential.user);
        }
    });
}
