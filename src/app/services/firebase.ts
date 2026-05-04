import { Injectable, signal } from '@angular/core';
import { FirebaseError, initializeApp } from 'firebase/app';
import { getFirestore, addDoc, collection, FirestoreError, getDocs, QuerySnapshot, setDoc, doc } from 'firebase/firestore';
import {
  User,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { UserProfile } from '../models/user-profile';
import { CommunityList } from '../components/community-components/community-list/community-list';

const firebaseConfig = {
  apiKey: "AIzaSyBnr5uMi2VefhFImTcf5lRrCSg0Su4Ign0",
  authDomain: "connected-a45d0.firebaseapp.com",
  projectId: "connected-a45d0",
  storageBucket: "connected-a45d0.firebasestorage.app",
  messagingSenderId: "53259761471",
  appId: "1:53259761471:web:aecd4db7dcaae67edb058a"
};

// Initialize Firebase App, Auth, and Firestore (db)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

@Injectable({ providedIn: 'root' })

export class FirebaseService {

  currentUser = signal<User | null>(null);
  currentAuthError = signal<string | null>(null);
  currentFirestoreError = signal<string | null>(null);

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

  async getUserName(): Promise<string> {
    if (!this.currentUser()) {
      return "N/A";
    }

    return this.currentUser()?.displayName!;
  }

  async setUserName(name: string): Promise<boolean> {
    try {
      const request = await updateProfile(
        this.currentUser()!,
        {
          displayName: name
        }
      );
      this.currentAuthError.set(null);
      return true;
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        this.currentAuthError.set(error.code + ": " + error.message);
      }
      return false;
    }
  }

  async addMajor(name: string): Promise<boolean> {
    try {
      const request = await addDoc(collection(db, "majors"), {
        name: name
      });
      this.currentFirestoreError.set(null);
      return true;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ": " + error.message);
      }
      return false;
    }
  }

  async getMajors(): Promise<QuerySnapshot | null>{
    try {
      const request = await getDocs(collection(db, "majors"));
      this.currentFirestoreError.set(null);
      return request;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ": " + error.message);
      }
      return null;
    }
  }

  async addDepartment(name: string): Promise<boolean> {
    try {
      const request = await addDoc(collection(db, "departments"), {
        name: name
      });
      this.currentFirestoreError.set(null);
      return true;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ": " + error.message);
      }
      return false;
    }
  }

  async getDepartments(): Promise<QuerySnapshot | null>{
    try {
      const request = await getDocs(collection(db, "departments"));
      this.currentFirestoreError.set(null);
      return request;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ": " + error.message);
      }
      return null;
    }
  }

  async createUserProfile(profile: UserProfile): Promise<boolean> {
    if (!this.currentUser()) {
      this.currentFirestoreError.set("No authenticated user.");
      return false;
    }

    try {
      await setDoc(doc(db, "users", this.currentUser()!.uid), profile);

      this.currentFirestoreError.set(null);
      return true;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ": " + error.message);
      }
      return false;
    }
  }

  async addCommunity(community: CommunityList): Promise<boolean> {
    try {
      const request = await addDoc(collection(db, "communities"), community);
      this.currentFirestoreError.set(null);
      return true;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ": " + error.message);
      }
      return false;
    }
  }

  async getCommunityList(): Promise<QuerySnapshot | null> {
    try {
      const request = await getDocs(collection(db, "communities"));
      this.currentFirestoreError.set(null);
      return request;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ": " + error.message);
      }
      return null;
    }
  }
}