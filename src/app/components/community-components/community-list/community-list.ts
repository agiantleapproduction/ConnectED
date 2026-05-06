import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FirebaseService } from '../../../services/firebase';

@Component({
  selector: 'app-community-list',
  imports: [FormsModule, RouterLink],
  templateUrl: './community-list.html',
  styleUrl: './community-list.css',
})
export class CommunityList {
  private firebaseService = inject(FirebaseService);

  searchTerm = '';

  communities = signal<{ id: string; name: string; description: string }[]>([]);
  myCommunities = signal<{ id: string; name: string; description: string }[]>([]);

  isTeacher = signal(false);
  teacherDepartment = signal<string | null>(null);

  // Create community form state
  showCreateForm = signal(false);
  newCommunityName = '';
  newCommunityDescription = '';
  createSubmitting = signal(false);
  createError = signal<string | null>(null);
  createSuccess = signal(false);

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadCommunities(), this.loadProfile()]);
  }

  private async loadProfile(): Promise<void> {
    const profile = await this.firebaseService.getCurrentUserProfile();
    if (!profile) return;
    this.isTeacher.set(profile.role === 'teacher');
    this.teacherDepartment.set(profile.department);
  }

  private async loadCommunities(): Promise<void> {
    const snapshot = await this.firebaseService.getCommunityList();
    if (!snapshot) return;

    const uid = this.firebaseService.currentUser()?.uid;
    const all: { id: string; name: string; description: string }[] = [];
    const mine: { id: string; name: string; description: string }[] = [];

    snapshot.docs.forEach((doc) => {
      const entry = {
        id: doc.id,
        name: String(doc.data()['name'] ?? ''),
        description: String(doc.data()['description'] ?? ''),
      };
      all.push(entry);
      if (uid && doc.data()['createdBy'] === uid) {
        mine.push(entry);
      }
    });

    this.communities.set(all);
    this.myCommunities.set(mine);
  }

  get filteredCommunities() {
    return this.communities().filter((community) =>
      community.name.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
  }

  toggleCreateForm(): void {
    this.showCreateForm.update((v) => !v);
    this.createError.set(null);
    this.createSuccess.set(false);
    this.newCommunityName = '';
    this.newCommunityDescription = '';
  }

  async submitCreateCommunity(): Promise<void> {
    this.createError.set(null);
    this.createSuccess.set(false);

    if (!this.newCommunityName.trim()) {
      this.createError.set('Community name is required.');
      return;
    }

    this.createSubmitting.set(true);
    const ok = await this.firebaseService.createCommunity({
      name: this.newCommunityName,
      description: this.newCommunityDescription,
    });
    this.createSubmitting.set(false);

    if (ok) {
      this.createSuccess.set(true);
      this.newCommunityName = '';
      this.newCommunityDescription = '';
      await this.loadCommunities();
    } else {
      this.createError.set(
        this.firebaseService.currentFirestoreError() ?? 'Failed to create community.',
      );
    }
  }
}
