import { Injectable, signal } from '@angular/core';
import { FirebaseError, initializeApp } from 'firebase/app';
import {
  getFirestore,
  addDoc,
  collection,
  FirestoreError,
  getDocs,
  QuerySnapshot,
  setDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
} from 'firebase/firestore';
import {
  User,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { UserProfile } from '../models/user-profile';
import { Post, CreatePostPayload, UpdatePostPayload } from '../models/post';

const firebaseConfig = {
  apiKey: 'AIzaSyBnr5uMi2VefhFImTcf5lRrCSg0Su4Ign0',
  authDomain: 'connected-a45d0.firebaseapp.com',
  projectId: 'connected-a45d0',
  storageBucket: 'connected-a45d0.firebasestorage.app',
  messagingSenderId: '53259761471',
  appId: '1:53259761471:web:aecd4db7dcaae67edb058a',
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
    if (email == '' || password == '') {
      this.currentAuthError.set('auth/invalid-input: Email and password are required.');
      return false;
    }

    try {
      const request = await createUserWithEmailAndPassword(auth, email, password);
      this.currentUser.set(request.user);
      this.currentAuthError.set(null);
      return true;
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        this.currentAuthError.set(error.code + ': ' + error.message);
      }
      return false;
    }
  }

  async userLogin(email: string, password: string): Promise<boolean> {
    if (email == '' || password == '') {
      this.currentAuthError.set('auth/invalid-input: Email and password are required.');
      return false;
    }

    try {
      const request = await signInWithEmailAndPassword(auth, email, password);
      this.currentUser.set(request.user);
      this.currentAuthError.set(null);
      return true;
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        this.currentAuthError.set(error.code + ': ' + error.message);
      }
      return false;
    }
  }

  async userLogout(): Promise<void> {
    await signOut(auth);
  }

  async getUserName(): Promise<string> {
    if (!this.currentUser()) {
      return 'N/A';
    }

    return this.currentUser()?.displayName!;
  }

  async setUserName(name: string): Promise<boolean> {
    try {
      const request = await updateProfile(this.currentUser()!, {
        displayName: name,
      });
      this.currentAuthError.set(null);
      return true;
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        this.currentAuthError.set(error.code + ': ' + error.message);
      }
      return false;
    }
  }

  async addMajor(name: string): Promise<boolean> {
    try {
      const request = await addDoc(collection(db, 'majors'), {
        name: name,
      });
      this.currentFirestoreError.set(null);
      return true;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return false;
    }
  }

  async getMajors(): Promise<QuerySnapshot | null> {
    try {
      const request = await getDocs(collection(db, 'majors'));
      this.currentFirestoreError.set(null);
      return request;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return null;
    }
  }

  async addDepartment(name: string): Promise<boolean> {
    try {
      const request = await addDoc(collection(db, 'departments'), {
        name: name,
      });
      this.currentFirestoreError.set(null);
      return true;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return false;
    }
  }

  async getDepartments(): Promise<QuerySnapshot | null> {
    try {
      const request = await getDocs(collection(db, 'departments'));
      this.currentFirestoreError.set(null);
      return request;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return null;
    }
  }

  async createUserProfile(profile: UserProfile): Promise<boolean> {
    if (!this.currentUser()) {
      this.currentFirestoreError.set('No authenticated user.');
      return false;
    }

    try {
      await setDoc(doc(db, 'users', this.currentUser()!.uid), profile);
      this.currentFirestoreError.set(null);
      return true;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return false;
    }
  }

  async addCommunity(community: { name: string; description: string }): Promise<boolean> {
    try {
      const request = await addDoc(collection(db, 'communities'), community);
      this.currentFirestoreError.set(null);
      return true;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return false;
    }
  }

  async getCommunityList(): Promise<QuerySnapshot | null> {
    try {
      const request = await getDocs(collection(db, 'communities'));
      this.currentFirestoreError.set(null);
      return request;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return null;
    }
  }

  async getGroupChats(communityId: string): Promise<QuerySnapshot | null> {
    try {
      const request = await getDocs(collection(db, 'groupchats'));
      this.currentFirestoreError.set(null);
      return request;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return null;
    }
  }

  async joinGroupChat(groupChatId: string): Promise<boolean> {
    if (!this.currentUser()) {
      this.currentFirestoreError.set('No authenticated user.');
      return false;
    }

    try {
      // Add user ID to the group chat's users array
      await updateDoc(doc(db, 'groupchats', groupChatId), {
        users: arrayUnion(this.currentUser()!.uid),
      });

      // Add group chat ID to the user's groupChatIds array
      await updateDoc(doc(db, 'users', this.currentUser()!.uid), {
        groupChatIds: arrayUnion(groupChatId),
      });

      this.currentFirestoreError.set(null);
      return true;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return false;
    }
  }

  async getUserGroupChats(): Promise<string[]> {
    if (!this.currentUser()) return [];

    try {
      const userDoc = await getDoc(doc(db, 'users', this.currentUser()!.uid));
      if (!userDoc.exists()) return [];

      const data = userDoc.data();
      return data['groupChatIds'] ?? [];
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return [];
    }
  }

  async isUserInGroupChat(groupChatId: string): Promise<boolean> {
    const uid = this.currentUser()?.uid;
    if (!uid) return false;
    try {
      const snap = await getDoc(doc(db, 'groupchats', groupChatId));
      if (!snap.exists()) return false;
      const users: string[] = snap.data()['users'] ?? [];
      return users.includes(uid);
    } catch {
      return false;
    }
  }

  async createGroupPost(payload: CreatePostPayload): Promise<Post | null> {
    const user = this.currentUser();
    if (!user) {
      this.currentFirestoreError.set('No authenticated user.');
      return null;
    }

    const isMember = await this.isUserInGroupChat(payload.groupChatId);
    if (!isMember) {
      this.currentFirestoreError.set('permission-denied: You must join the group chat before posting.');
      return null;
    }

    const now = Date.now();
    const postData: Omit<Post, 'id'> = {
      groupChatId: payload.groupChatId,
      communityId: payload.communityId,
      authorId: user.uid,
      authorName: user.displayName ?? user.email ?? 'Unknown',
      authorRole: 'member',
      body: payload.body,
      likeCount: 0,
      likedByUserIds: [],
      createdAt: now,
      updatedAt: now,
    };

    try {
      const ref = await addDoc(collection(db, 'posts'), postData);
      this.currentFirestoreError.set(null);
      return { id: ref.id, ...postData };
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return null;
    }
  }

  async getGroupPosts(groupChatId: string): Promise<Post[]> {
    try {
      const q = query(
        collection(db, 'posts'),
        where('groupChatId', '==', groupChatId),
      );
      const snapshot = await getDocs(q);
      this.currentFirestoreError.set(null);
      return snapshot.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Post, 'id'>) }))
        .sort((a, b) => a.createdAt - b.createdAt);
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return [];
    }
  }

  async getLatestPosts(count = 20): Promise<Post[]> {
    try {
      const q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(count),
      );
      const snapshot = await getDocs(q);
      this.currentFirestoreError.set(null);
      return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Post, 'id'>) }));
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return [];
    }
  }

  async updateGroupPost(payload: UpdatePostPayload): Promise<boolean> {
    const user = this.currentUser();
    if (!user) {
      this.currentFirestoreError.set('No authenticated user.');
      return false;
    }

    try {
      const ref = doc(db, 'posts', payload.id);
      const snap = await getDoc(ref);
      if (!snap.exists() || snap.data()['authorId'] !== user.uid) {
        this.currentFirestoreError.set('permission-denied: You can only edit your own posts.');
        return false;
      }

      await updateDoc(ref, { body: payload.body, updatedAt: Date.now() });
      this.currentFirestoreError.set(null);
      return true;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return false;
    }
  }

  async deleteGroupPost(postId: string): Promise<boolean> {
    const user = this.currentUser();
    if (!user) {
      this.currentFirestoreError.set('No authenticated user.');
      return false;
    }

    try {
      const ref = doc(db, 'posts', postId);
      const snap = await getDoc(ref);
      if (!snap.exists() || snap.data()['authorId'] !== user.uid) {
        this.currentFirestoreError.set('permission-denied: You can only delete your own posts.');
        return false;
      }

      await deleteDoc(ref);
      this.currentFirestoreError.set(null);
      return true;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return false;
    }
  }

  async togglePostLike(postId: string): Promise<boolean> {
    const user = this.currentUser();
    if (!user) {
      this.currentFirestoreError.set('No authenticated user.');
      return false;
    }

    try {
      const ref = doc(db, 'posts', postId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        this.currentFirestoreError.set('not-found: Post does not exist.');
        return false;
      }

      const data = snap.data();
      const liked: string[] = data['likedByUserIds'] ?? [];
      const alreadyLiked = liked.includes(user.uid);

      await updateDoc(ref, {
        likedByUserIds: alreadyLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
        likeCount: (data['likeCount'] ?? 0) + (alreadyLiked ? -1 : 1),
      });

      this.currentFirestoreError.set(null);
      return true;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return false;
    }
  }

  async getGroupChatInfo(groupChatId: string): Promise<{ id: string; name: string; communityId: string; chatType: string; courseNumber: string; memberCount: number } | null> {
    try {
      const snap = await getDoc(doc(db, 'groupchats', groupChatId));
      if (!snap.exists()) return null;
      const data = snap.data();
      this.currentFirestoreError.set(null);
      return {
        id: snap.id,
        name: String(data['name'] ?? ''),
        communityId: String(data['communityId'] ?? ''),
        chatType: String(data['chatType'] ?? ''),
        courseNumber: String(data['courseNumber'] ?? ''),
        memberCount: (data['users'] as string[] | undefined)?.length ?? 0,
      };
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return null;
    }
  }

  async updateUserProfile(updates: Partial<Pick<UserProfile, 'name' | 'major' | 'department'>>): Promise<boolean> {
    const uid = this.currentUser()?.uid;
    if (!uid) {
      this.currentFirestoreError.set('No authenticated user.');
      return false;
    }

    try {
      await updateDoc(doc(db, 'users', uid), updates as Record<string, unknown>);
      if (updates.name) {
        await updateProfile(this.currentUser()!, { displayName: updates.name });
      }
      this.currentFirestoreError.set(null);
      return true;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return false;
    }
  }

  async getCurrentUserProfile(): Promise<UserProfile | null> {
    const uid = this.currentUser()?.uid;
    if (!uid) return null;
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (!snap.exists()) return null;
      this.currentFirestoreError.set(null);
      return snap.data() as UserProfile;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return null;
    }
  }

  async createCommunity(payload: { name: string; description: string }): Promise<boolean> {
    const uid = this.currentUser()?.uid;
    if (!uid) {
      this.currentFirestoreError.set('No authenticated user.');
      return false;
    }

    const profile = await this.getCurrentUserProfile();
    if (!profile || profile.role !== 'teacher') {
      this.currentFirestoreError.set('permission-denied: Only teachers can create communities.');
      return false;
    }

    const name = payload.name.trim();
    const description = payload.description.trim();
    if (!name) {
      this.currentFirestoreError.set('validation: Community name is required.');
      return false;
    }

    try {
      await addDoc(collection(db, 'communities'), {
        name,
        description,
        department: profile.department ?? '',
        createdBy: uid,
        createdAt: Date.now(),
      });
      this.currentFirestoreError.set(null);
      return true;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return false;
    }
  }

  async createGroupChat(payload: { name: string; communityId: string; chatType: 'User' | 'Course'; courseNumber?: string }): Promise<string | null> {
    const uid = this.currentUser()?.uid;
    if (!uid) {
      this.currentFirestoreError.set('No authenticated user.');
      return null;
    }

    const name = payload.name.trim();
    if (!name) {
      this.currentFirestoreError.set('validation: Chat name is required.');
      return null;
    }

    if (payload.chatType === 'Course') {
      const profile = await this.getCurrentUserProfile();
      if (!profile || profile.role !== 'teacher') {
        this.currentFirestoreError.set('permission-denied: Only teachers can create course group chats.');
        return null;
      }
      const courseNumber = (payload.courseNumber ?? '').trim();
      if (!courseNumber) {
        this.currentFirestoreError.set('validation: Course number is required for course chats.');
        return null;
      }
    }

    try {
      const ref = await addDoc(collection(db, 'groupchats'), {
        name,
        communityId: payload.communityId,
        chatType: payload.chatType,
        courseNumber: payload.chatType === 'Course' ? (payload.courseNumber ?? '').trim() : '',
        users: [uid],
        createdBy: uid,
        createdAt: Date.now(),
      });

      await updateDoc(doc(db, 'users', uid), {
        groupChatIds: arrayUnion(ref.id),
      });

      this.currentFirestoreError.set(null);
      return ref.id;
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        this.currentFirestoreError.set(error.code + ': ' + error.message);
      }
      return null;
    }
  }
}
