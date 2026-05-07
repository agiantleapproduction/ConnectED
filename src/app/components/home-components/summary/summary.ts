import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FirebaseService } from '../../../services/firebase';
import { Post } from '../../../models/post';

@Component({
  selector: 'app-summary',
  imports: [RouterLink],
  templateUrl: './summary.html',
  styleUrl: './summary.css',
})
export class Summary implements OnInit {
  protected firebase = inject(FirebaseService);

  posts = signal<Post[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  groupChatNames = signal<Record<string, string>>({});

  ngOnInit(): void {
    this.loadPosts();
  }

  async loadPosts(): Promise<void> {
    this.loading.set(true);
    const result = await this.firebase.getLatestPosts(20);
    const err = this.firebase.currentFirestoreError();
    if (err) this.error.set(err);
    this.posts.set(result);

    const uniqueIds = [...new Set(result.map((p) => p.groupChatId))];
    const entries = await Promise.all(
      uniqueIds.map(async (id) => {
        const info = await this.firebase.getGroupChatInfo(id);
        return [id, info?.name ?? id] as const;
      }),
    );
    this.groupChatNames.set(Object.fromEntries(entries));

    this.loading.set(false);
  }

  formatDate(ts: number): string {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  async onLike(post: Post): Promise<void> {
    const ok = await this.firebase.togglePostLike(post.id);
    if (ok) {
      const uid = this.firebase.currentUser()?.uid;
      if (!uid) return;
      const alreadyLiked = post.likedByUserIds.includes(uid);
      this.posts.update((list) =>
        list.map((p) =>
          p.id === post.id
            ? {
                ...p,
                likeCount: p.likeCount + (alreadyLiked ? -1 : 1),
                likedByUserIds: alreadyLiked
                  ? p.likedByUserIds.filter((id) => id !== uid)
                  : [...p.likedByUserIds, uid],
              }
            : p,
        ),
      );
    }
  }
}
