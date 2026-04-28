import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { FirebaseService } from './services/firebase';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ConnectED');
  private readonly firebaseService = inject(FirebaseService);
}
