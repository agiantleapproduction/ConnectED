import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
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
  private readonly router = inject(Router);

  async onLogout(event?: Event): Promise<void> {
    event?.preventDefault();
    await this.firebaseService.userLogout();
    await this.router.navigateByUrl('/login');
  }
}
