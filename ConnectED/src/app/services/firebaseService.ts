import { Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { User, getAuth, createUserWithEmailAndPassword } from "firebase/auth";

@Injectable({
  providedIn: 'root',
})

// TODO: Replace the following with your app's Firebase configuration
const firebaseConfig = {
  //...
};

// Initialize Firebase and Firebase Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export class Firebase {

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
