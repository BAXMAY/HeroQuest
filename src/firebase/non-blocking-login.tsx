'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { doc, setDoc, Firestore, getDoc } from 'firebase/firestore';
import { getSdks } from '.';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

const createProfile = (user: User, firestore: Firestore) => {
    const userProfileRef = doc(firestore, 'users', user.uid);
    const profileData = {
        id: user.uid,
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || user.email?.split('@')[0] || '',
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
    const { firestore } = getSdks(authInstance.app);
    createUserWithEmailAndPassword(authInstance, email, password)
    .then(credential => {
        createProfile(credential.user, firestore);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate Google sign-in (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): void {
    const provider = new GoogleAuthProvider();
    const { firestore } = getSdks(authInstance.app);
    signInWithPopup(authInstance, provider)
    .then(async (credential) => {
        const userProfileRef = doc(firestore, 'users', credential.user.uid);
        const docSnap = await getDoc(userProfileRef);

        if (!docSnap.exists()) {
            createProfile(credential.user, firestore);
        }
    });
}
