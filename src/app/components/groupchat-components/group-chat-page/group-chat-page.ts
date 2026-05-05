import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirebaseService } from '../../../services/firebase';
import { ChatSidebar } from '../chat-sidebar/chat-sidebar';
import { MessageList } from '../message-list/message-list';

@Component({
  selector: 'app-group-chat-page',
  imports: [ChatSidebar, MessageList],
  templateUrl: './group-chat-page.html',
  styleUrl: './group-chat-page.css',
})
export class GroupChatPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private firebase = inject(FirebaseService);
  private paramSub?: Subscription;

  chatId = signal<string | null>(null);
  communityId = signal('');
  chatName = signal('');
  isMember = signal(false);
  loading = signal(true);

  ngOnInit(): void {
    this.paramSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) this.loadChat(id);
    });
  }

  ngOnDestroy(): void {
    this.paramSub?.unsubscribe();
  }

  private async loadChat(id: string): Promise<void> {
    this.loading.set(true);
    this.chatId.set(id);

    const [info, member] = await Promise.all([
      this.firebase.getGroupChatInfo(id),
      this.firebase.isUserInGroupChat(id),
    ]);

    if (info) {
      this.chatName.set(info.name);
      this.communityId.set(info.communityId);
    }
    this.isMember.set(member);
    this.loading.set(false);
  }
}

