import { FirebaseService } from './../../services/firebase';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { NgHcaptchaModule } from 'ng-hcaptcha';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, NgHcaptchaModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly firebaseService = inject(FirebaseService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly authError = this.firebaseService.currentAuthError;
  readonly captchaToken = signal<string | null>(null);

  onCaptchaVerified(token: string): void {
    this.captchaToken.set(token);
  }

  onCaptchaExpired(): void {
    this.captchaToken.set(null);
  }

  async onSubmit(form: NgForm): Promise<void> {
    if (form.invalid || !this.captchaToken()) return;

    const { email, password } = form.value;

    const ok = await this.firebaseService.userLogin(email, password);

    if (ok) {
      await this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('redirectTo') || '/');
    }
  }
}
