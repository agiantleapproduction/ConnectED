import { Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { User, getAuth, createUserWithEmailAndPassword } from "firebase/auth";

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
  currentAuthError = signal<String | null>(null);

  userSignUp(email: string, password: string): boolean {
    if (email == "" || password == "") {
      return false;
    }

    createUserWithEmailAndPassword(auth, email, password).then((userCredentials) => {
      this.currentUser.set(userCredentials.user);
      return true;
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      this.currentAuthError.set(errorCode + ": " + errorMessage);
      return false;
    });
    return false;
  }
}
