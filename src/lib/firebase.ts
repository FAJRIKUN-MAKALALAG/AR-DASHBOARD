import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfigJson.firestoreDatabaseId || undefined);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  onSnapshot,
  serverTimestamp
};

export type { FirebaseUser };

/**
 * Saves or updates user profile in Firestore
 */
export async function syncUserProfile(user: FirebaseUser, extraData?: { role?: string; department?: string }) {
  if (!user || !user.uid) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    const existingSnap = await getDoc(userRef);
    
    const baseData = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
      lastLoginAt: serverTimestamp()
    };

    if (!existingSnap.exists()) {
      await setDoc(userRef, {
        ...baseData,
        role: extraData?.role || 'Finance AR Analyst (Tester)',
        department: extraData?.department || 'Finance & Collection',
        createdAt: serverTimestamp()
      });
    } else {
      await setDoc(userRef, {
        ...baseData,
        ...(extraData?.role ? { role: extraData.role } : {}),
        ...(extraData?.department ? { department: extraData.department } : {})
      }, { merge: true });
    }
  } catch (error) {
    console.warn('Firestore profile sync error:', error);
  }
}
