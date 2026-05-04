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

  // All communities from Firebase
  communities = signal<{ id: string; name: string; description: string }[]>([]);

  // My communities — placeholder
  myCommunities = signal<{ id: string; name: string; description: string }[]>([
    { id: '1', name: 'Computer Science', description: 'Discuss all things CS' },
    { id: '2', name: 'Engineering', description: 'Engineering discussions and resources' },
  ]);

  async ngOnInit(): Promise<void> {
    await this.loadCommunities();
  }

  private async loadCommunities(): Promise<void> {
    const snapshot = await this.firebaseService.getCommunityList();
    if (!snapshot) return;

    const communityData = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: String(doc.data()['name'] ?? ''),
      description: String(doc.data()['description'] ?? ''),
    }));

    this.communities.set(communityData);
  }

  get filteredCommunities() {
    return this.communities().filter((community) =>
      community.name.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
  }
}
