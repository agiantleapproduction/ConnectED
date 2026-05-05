import { Component, inject, signal, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase';
import { Post } from '../../../models/post';
import { MessageInput } from '../message-input/message-input';

@Component({
  selector: 'app-message-list',
  imports: [MessageInput, FormsModule],
  templateUrl: './message-list.html',
  styleUrl: './message-list.css',
})
export class MessageList implements OnChanges {
  private firebase = inject(FirebaseService);

  @Input() groupChatId!: string;
  @Input() communityId!: string;
  @Input() isMember = false;

  posts = signal<Post[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  editingPostId = signal<string | null>(null);
  editBody = '';

  get currentUserId(): string | undefined {
    return this.firebase.currentUser()?.uid;
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['groupChatId'] && this.groupChatId) {
      await this.loadPosts();
    }
  }

  async loadPosts(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    const result = await this.firebase.getGroupPosts(this.groupChatId);
    const err = this.firebase.currentFirestoreError();
    if (err) {
      this.error.set(err);
    }
    this.posts.set(result);
    this.loading.set(false);
  }

  async onPostSubmit(body: string): Promise<void> {
    const created = await this.firebase.createGroupPost({
      groupChatId: this.groupChatId,
      communityId: this.communityId,
      body,
    });
    if (created) {
      // Optimistic update so the post appears immediately, then confirm from server
      this.posts.update((list) => [...list, created]);
      // Reload from Firestore to get the authoritative sorted list
      const fresh = await this.firebase.getGroupPosts(this.groupChatId);
      if (fresh.length > 0) this.posts.set(fresh);
    } else {
      this.error.set(this.firebase.currentFirestoreError());
    }
  }

  async onLike(post: Post): Promise<void> {
    const ok = await this.firebase.togglePostLike(post.id);
    if (ok) {
      const uid = this.currentUserId!;
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

  startEdit(post: Post): void {
    this.editingPostId.set(post.id);
    this.editBody = post.body;
  }

  cancelEdit(): void {
    this.editingPostId.set(null);
    this.editBody = '';
  }

  async submitEdit(post: Post): Promise<void> {
    const text = this.editBody.trim();
    if (!text) return;
    const ok = await this.firebase.updateGroupPost({ id: post.id, body: text });
    if (ok) {
      this.posts.update((list) =>
        list.map((p) => (p.id === post.id ? { ...p, body: text, updatedAt: Date.now() } : p)),
      );
      this.cancelEdit();
    } else {
      this.error.set(this.firebase.currentFirestoreError());
    }
  }

  async onDelete(post: Post): Promise<void> {
    const ok = await this.firebase.deleteGroupPost(post.id);
    if (ok) {
      this.posts.update((list) => list.filter((p) => p.id !== post.id));
    } else {
      this.error.set(this.firebase.currentFirestoreError());
    }
  }

  formatDate(ts: number): string {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
}
