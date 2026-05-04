import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-list',
  imports: [FormsModule],
  templateUrl: './message-list.html',
  styleUrl: './message-list.css',
})
export class MessageList {
  // Grabs the community id from the URL
  private route = inject(ActivatedRoute);
  communityId = this.route.snapshot.paramMap.get('id');

  // course group chats
  courseGroupChats = [
    {
      id: 'c1',
      name: 'CS101 - Intro to Programming',
      courseNumber: 'CS101',
      members: 45,
      chatType: 'Course',
    },
    {
      id: 'c2',
      name: 'CS201 - Data Structures',
      courseNumber: 'CS201',
      members: 38,
      chatType: 'Course',
    },
    {
      id: 'c3',
      name: 'CS301 - Algorithms',
      courseNumber: 'CS301',
      members: 30,
      chatType: 'Course',
    },
  ];

  //  group chats
  userGroupChats = [
    { id: 'u1', name: 'Study Group for Finals', members: 12, chatType: 'User' },
    { id: 'u2', name: 'CS Club General Chat', members: 25, chatType: 'User' },
    { id: 'u3', name: 'Homework Help', members: 18, chatType: 'User' },
  ];

  // Join group chat
  joinGroupChat(groupChatId: string) {
    console.log('Joining group chat:', groupChatId);
    // we need to add firebase logic here
  }
}
