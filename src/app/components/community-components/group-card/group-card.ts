import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../../../services/firebase';

@Component({
  selector: 'app-group-card',
  imports: [],
  templateUrl: './group-card.html',
  styleUrl: './group-card.css',
})
export class GroupCard {
  private route = inject(ActivatedRoute);
  private firebaseService = inject(FirebaseService);

  communityId = this.route.snapshot.paramMap.get('id');

  courseGroupChats = signal<
    { id: string; name: string; courseNumber: string; members: string[] }[]
  >([]);
  userGroupChats = signal<{ id: string; name: string; members: string[] }[]>([]);
  joinedChats = signal<Set<string>>(new Set());

  async ngOnInit(): Promise<void> {
    await this.loadGroupChats();
  }

  private async loadGroupChats(): Promise<void> {
    const snapshot = await this.firebaseService.getGroupChats(this.communityId!);
    if (!snapshot) return;

    const course: { id: string; name: string; courseNumber: string; members: string[] }[] = [];
    const user: { id: string; name: string; members: string[] }[] = [];
    const alreadyJoined = new Set<string>();

    const currentUserId = this.firebaseService.currentUser()?.uid;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      if (data['communityId'] !== this.communityId) return;

      const members: string[] = data['users'] ?? [];

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
    this.joinedChats.set(alreadyJoined);
  }

  async joinGroupChat(groupChatId: string): Promise<void> {
    const success = await this.firebaseService.joinGroupChat(groupChatId);
    if (success) {
      const updated = new Set(this.joinedChats());
      updated.add(groupChatId);
      this.joinedChats.set(updated);
      await this.loadGroupChats();
    }
  }
}
