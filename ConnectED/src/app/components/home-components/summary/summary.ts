import { Component } from '@angular/core';

@Component({
  selector: 'app-summary',
  imports: [],
  templateUrl: './summary.html',
  styleUrl: './summary.css',
})
export class Summary {
  posts = [
    {
      name: 'Student 1',
      community: 'Community Name',
      date: '27, April 2026',
      role: 'Computer Science Major',
      roleType: 'student', //controls pink vs yellow color
      body: 'Computer Science assignment 5 took forever. But it eas good practice!',
    },
    {
      name: 'Teacher 1',
      community: 'Community Name',
      date: '25, April 2026',
      role: 'Computer Science Instructor',
      roleType: 'teacher',
      body: "Class, assignment 5 will be do two weeks from now. Start on it early I wouldn't wait last minute.",
    },

    {
      name: 'Student 2',
      community: 'Community Name',
      date: '26, April 2026',
      role: 'Software Engineer Major',
      roleType: 'student',
      body: 'Anyone taking database systems next semester?',
    },

    {
      name: 'Teacher 1',
      community: 'Community Name',
      date: '25, April 2026',
      role: 'Computer Science Instructor',
      roleType: 'teacher',
      body: "Class, assignment 5 will be do two weeks from now. Start on it early I wouldn't wait last minute.",
    },

    {
      name: 'Student 1',
      community: 'Community Name',
      date: '27, April 2026',
      role: 'Computer Science Major',
      roleType: 'student', //controls pink vs yellow color
      body: 'Computer Science assignment 5 took forever. But it eas good practice!',
    },
  ];
}
