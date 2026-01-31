import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '../types';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Email/Password Sign Up
export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
};

// Email/Password Sign In
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

// Google Sign In
export const signInWithGoogle = async (): Promise<User> => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

// Phone Auth - Setup Recaptcha
export const setupRecaptcha = (buttonId: string): RecaptchaVerifier => {
  const recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
  });
  return recaptchaVerifier;
};

// Phone Auth - Send SMS
export const sendPhoneVerification = async (
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  return confirmationResult;
};

// Phone Auth - Verify Code
export const verifyPhoneCode = async (
  confirmationResult: ConfirmationResult,
  code: string
): Promise<User> => {
  const result = await confirmationResult.confirm(code);
  return result.user;
};

// Sign Out
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

// Create or update user profile in Firestore
export const createUserProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      id: userId,
      createdAt: new Date().toISOString(),
      ...profileData,
    });
  } else {
    await setDoc(userRef, profileData, { merge: true });
  }
};

// Get user profile from Firestore
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

// Auth state observer
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
