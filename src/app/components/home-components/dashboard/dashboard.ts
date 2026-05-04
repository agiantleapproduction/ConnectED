import { Component, inject } from '@angular/core';
import { Summary } from '../summary/summary';
import { FirebaseService } from '../../../services/firebase';

@Component({
  selector: 'app-dashboard',
  imports: [Summary],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly firebaseService = inject(FirebaseService);

  
}
