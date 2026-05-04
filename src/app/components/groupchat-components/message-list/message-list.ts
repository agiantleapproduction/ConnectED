import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../../../services/firebase';

@Component({
  selector: 'app-message-list',
  imports: [],
  templateUrl: './message-list.html',
  styleUrl: './message-list.css',
})
export class MessageList {
  private route = inject(ActivatedRoute);
  private firebaseService = inject(FirebaseService);

  // Grabs the community id from the URL
  communityId = this.route.snapshot.paramMap.get('id');

  // Group chats loaded from Firebase
  courseGroupChats = signal<
    { id: string; name: string; courseNumber: string; members: string[] }[]
  >([]);
  userGroupChats = signal<{ id: string; name: string; members: string[] }[]>([]);

  // Tracks which chats the user has already joined
  joinedChats = signal<Set<string>>(new Set());

  async ngOnInit(): Promise<void> {
    await this.loadGroupChats();
  }

  private async loadGroupChats(): Promise<void> {
    const snapshot = await this.firebaseService.getGroupChats(this.communityId!);
    if (!snapshot) return;

    const course: { id: string; name: string; courseNumber: string; members: string[] }[] = [];
    const user: { id: string; name: string; members: string[] }[] = [];
    const alreadyJoined = new Set<string>(); // tracks already joined chats

    const currentUserId = this.firebaseService.currentUser()?.uid;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      // Only load group chats that belong to this community
      if (data['communityId'] !== this.communityId) return;

      const members: string[] = data['users'] ?? [];

      // If current user is already in the users array mark as joined
      if (currentUserId && members.includes(currentUserId)) {
        alreadyJoined.add(doc.id);
      }

      if (data['chatType'] === 'Course') {
        course.push({
          id: doc.id,
          name: String(data['name'] ?? ''),
          courseNumber: String(data['courseNumber'] ?? ''),
          members,
        });
      } else {
        user.push({
          id: doc.id,
          name: String(data['name'] ?? ''),
          members,
        });
      }
    });

    this.courseGroupChats.set(course);
    this.userGroupChats.set(user);
    this.joinedChats.set(alreadyJoined); // restore joined state from Firebase
  }

  async joinGroupChat(groupChatId: string): Promise<void> {
    const success = await this.firebaseService.joinGroupChat(groupChatId);
    if (success) {
      const updated = new Set(this.joinedChats()); // copy existing set
      updated.add(groupChatId); // add new id
      this.joinedChats.set(updated); // update signal
      await this.loadGroupChats(); // refresh the list
    }
  }
}
