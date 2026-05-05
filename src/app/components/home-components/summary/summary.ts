import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from '../../../services/firebase';

interface Post {
  name: string;
  community: string;
  date: string;
  roleType: string;
  role: string;
  body: string;
  likes: number;
}

@Component({
  selector: 'app-summary',
  imports: [],
  templateUrl: './summary.html',
  styleUrl: './summary.css',
})
export class Summary implements OnInit {
  private firebase = inject(FirebaseService);

  posts: Post[] = [];

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.posts = [
      {
        name: 'Jane Doe',
        community: 'Computer Science161',
        date: 'May 3, 2026',
        roleType: 'student',
        role: 'Student',
        body: "Does anyone have notes from last week's lecture on recursion? I missed class.",
        likes: 4,
      },
      {
        name: 'Prof. Smith',
        community: 'Mathematics160',
        date: 'May 2, 2026',
        roleType: 'instructor',
        role: 'Instructor',
        body: 'Office hours are moved to Thursday 3–5 PM this week.',
        likes: 12,
      },
      {
        name: 'Alex Johnson',
        community: 'Engineering213',
        date: 'May 1, 2026',
        roleType: 'student',
        role: 'Student',
        body: "Great study session today! Who's up for another one before finals?",
        likes: 7,
      },
    ];
  }

  replyToPost(post: Post): void {
    console.log('Reply to post by:', post.name);
  }

  editPost(post: Post): void {
    const user = this.firebase.currentUser();
    if (!user) return;
    console.log('Edit post by:', post.name);
  }

  deletePost(post: Post): void {
    const user = this.firebase.currentUser();
    if (!user) return;
    this.posts = this.posts.filter((p) => p !== post);
  }

  likePost(post: Post): void {
    post.likes++;
  }
}
