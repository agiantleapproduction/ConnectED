import { Injectable, signal } from '@angular/core';
import { FirebaseError, initializeApp } from 'firebase/app';
import {
  User,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBnr5uMi2VefhFImTcf5lRrCSg0Su4Ign0",
  authDomain: "connected-a45d0.firebaseapp.com",
  projectId: "connected-a45d0",
  storageBucket: "connected-a45d0.firebasestorage.app",
  messagingSenderId: "53259761471",
  appId: "1:53259761471:web:aecd4db7dcaae67edb058a"
};

// Initialize Firebase and Firebase Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

@Injectable({ providedIn: 'root' })

export class FirebaseService {

  currentUser = signal<User | null>(null);
  currentAuthError = signal<string | null>(null);

  constructor() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser.set(user);
    });
  }

  async userSignUp(email: string, password: string): Promise<boolean> {
    if (email == "" || password == "") {
      this.currentAuthError.set('auth/invalid-input: Email and password are required.');
      return false;
    }

    try {
      const request = await createUserWithEmailAndPassword(auth, email, password);
      this.currentUser.set(request.user);
      this.currentAuthError.set(null);
      return true;
    } catch(error: unknown) {
      if (error instanceof FirebaseError) {
        this.currentAuthError.set(error.code + ": " + error.message);
      }
      return false;
    }
  }

  async userLogin(email: string, password: string): Promise<boolean> {
    if (email == "" || password == "") {
      this.currentAuthError.set('auth/invalid-input: Email and password are required.');
      return false;
    }

    try {
      const request = await signInWithEmailAndPassword(auth, email, password);
      this.currentUser.set(request.user);
      this.currentAuthError.set(null);
      return true;
    } catch(error: unknown) {
      if (error instanceof FirebaseError) {
        this.currentAuthError.set(error.code + ": " + error.message);
      }
      return false;
    }
  }

  async userLogout(): Promise<void> {
    await signOut(auth);
  }
}
