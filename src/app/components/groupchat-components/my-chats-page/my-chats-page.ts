import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FirebaseService } from '../../../services/firebase';

interface JoinedChat {
  id: string;
  name: string;
  communityId: string;
  chatType: string;
  courseNumber: string;
  memberCount: number;
}

@Component({
  selector: 'app-my-chats-page',
  imports: [RouterLink],
  templateUrl: './my-chats-page.html',
  styleUrl: './my-chats-page.css',
})
export class MyChatsPage implements OnInit {
  private firebase = inject(FirebaseService);

  chats = signal<JoinedChat[]>([]);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    const ids = await this.firebase.getUserGroupChats();
    const resolved: JoinedChat[] = [];

    for (const id of ids) {
      const info = await this.firebase.getGroupChatInfo(id);
      if (info) resolved.push(info);
    }

    this.chats.set(resolved);
    this.loading.set(false);
  }
}
