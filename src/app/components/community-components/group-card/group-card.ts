import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase';

@Component({
  selector: 'app-group-card',
  imports: [RouterLink, FormsModule],
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

  // Role / profile
  isTeacher = signal(false);

  // Create chat form state
  showCreateForm = signal(false);
  newChatName = '';
  newChatType: 'User' | 'Course' = 'User';
  newCourseNumber = '';
  createSubmitting = signal(false);
  createError = signal<string | null>(null);
  createSuccess = signal(false);

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadGroupChats(), this.loadProfile()]);
  }

  private async loadProfile(): Promise<void> {
    const profile = await this.firebaseService.getCurrentUserProfile();
    if (!profile) return;
    this.isTeacher.set(profile.role === 'teacher');
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

  toggleCreateForm(): void {
    this.showCreateForm.update((v) => !v);
    this.createError.set(null);
    this.createSuccess.set(false);
    this.newChatName = '';
    this.newChatType = 'User';
    this.newCourseNumber = '';
  }

  async submitCreateChat(): Promise<void> {
    this.createError.set(null);
    this.createSuccess.set(false);

    if (!this.newChatName.trim()) {
      this.createError.set('Chat name is required.');
      return;
    }
    if (this.newChatType === 'Course' && !this.newCourseNumber.trim()) {
      this.createError.set('Course number is required for course chats.');
      return;
    }

    this.createSubmitting.set(true);
    const id = await this.firebaseService.createGroupChat({
      name: this.newChatName,
      communityId: this.communityId!,
      chatType: this.newChatType,
      courseNumber: this.newChatType === 'Course' ? this.newCourseNumber : undefined,
    });
    this.createSubmitting.set(false);

    if (id) {
      this.createSuccess.set(true);
      this.newChatName = '';
      this.newCourseNumber = '';
      this.newChatType = 'User';
      // Auto-mark as joined (creator is added to users array by service)
      const updated = new Set(this.joinedChats());
      updated.add(id);
      this.joinedChats.set(updated);
      await this.loadGroupChats();
    } else {
      this.createError.set(this.firebaseService.currentFirestoreError() ?? 'Failed to create chat.');
    }
  }
}
