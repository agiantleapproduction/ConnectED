import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-community-list',
  imports: [FormsModule, RouterLink],
  templateUrl: './community-list.html',
  styleUrl: './community-list.css',
})
export class CommunityList {
  // Search term that updates as user types
  searchTerm = '';

  // communities
  communities = [
    { id: '1', name: 'Computer Science161', description: 'Discuss all things CS', members: 120 },
    {
      id: '2',
      name: 'Engineering213',
      description: 'Engineering discussions and resources',
      members: 85,
    },
    { id: '3', name: 'Business332', description: 'Business and entrepreneurship', members: 95 },
    { id: '4', name: 'Mathematics160', description: 'Math help and discussions', members: 60 },
    { id: '5', name: 'Physics160', description: 'Physics concepts and study groups', members: 45 },
    { id: '6', name: 'Biology214', description: 'Life sciences community', members: 70 },
  ];

  // filters the list as searchTerm changes
  get filteredCommunities() {
    return this.communities.filter((community) =>
      community.name.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
  }
}
