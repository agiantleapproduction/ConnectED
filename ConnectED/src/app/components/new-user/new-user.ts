import { FirebaseService } from './../../services/firebase';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { NgHcaptchaModule } from 'ng-hcaptcha';

@Component({
  selector: 'app-new-user',
  imports: [RouterLink, FormsModule, NgHcaptchaModule],
  templateUrl: './new-user.html',
  styleUrl: './new-user.css',
})
export class NewUser {
  private readonly firebaseService = inject(FirebaseService);
  private readonly router = inject(Router);
  readonly authError = this.firebaseService.currentAuthError;
  readonly passwordMismatch = signal(false);
  readonly captchaToken = signal<string | null>(null);

  onCaptchaVerified(token: string): void {
    this.captchaToken.set(token);
  }

  onCaptchaExpired(): void {
    this.captchaToken.set(null);
  }

  async onSubmit(form: NgForm): Promise<void> {
    if (form.invalid || !this.captchaToken()) return;

    const { email, password, confirmPassword } = form.value;
    const mismatch = password !== confirmPassword;
    this.passwordMismatch.set(mismatch);

    if (mismatch) return;

    const ok = await this.firebaseService.userSignUp(email, password);

    if (ok) {
      await this.router.navigateByUrl('/');
    }
  }
}
