import { FirebaseService } from './../../services/firebase';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { NgHcaptchaModule } from 'ng-hcaptcha';

@Component({
  selector: 'app-new-user',
  imports: [RouterLink, FormsModule, NgHcaptchaModule],
  templateUrl: './new-user.html',
  styleUrls: ['../login/login.css', './new-user.css'],
})

export class NewUser {
  private readonly firebaseService = inject(FirebaseService);
  private readonly router = inject(Router);

  readonly authError = this.firebaseService.currentAuthError;
  readonly fireStoreError = this.firebaseService.currentFirestoreError;
  readonly passwordMismatch = signal(false);
  readonly captchaToken = signal<string | null>(null);

  readonly majors = signal<string[]>([]);
  readonly showAddMajorModal = signal(false);

  selectedMajor = "";
  newMajorName = "";
  pendingNewMajor = "";

  async ngOnInit(): Promise<void> {
    await this.loadMajors();
  }

  // TODO: Maybe move this to firebase.ts?
  private async loadMajors(): Promise<void> {
    const snapshot = await this.firebaseService.getMajors();
    if (!snapshot) return;

    const majorNames = snapshot.docs
      .map((doc) => String(doc.data()["name"] ?? "").trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    this.majors.set(majorNames);
  }

  openAddMajorModal(): void {
    this.newMajorName = "";
    this.showAddMajorModal.set(true);
  }

  closeAddMajorModal(): void {
    this.showAddMajorModal.set(false);
  }

  async addMajorFromModal(): Promise<void> {
    const major = this.newMajorName.trim();
    if (!major) return;

    const existing = this.majors().find(
      (item) => item.toLowerCase() == major.toLowerCase()
    );

    if (existing) {
      this.selectedMajor = existing;
      this.closeAddMajorModal();
      return;
    }

    this.pendingNewMajor = major;
    this.majors.set([...this.majors(), major].sort((a, b) => a.localeCompare(b)));
    this.selectedMajor = major;
    this.newMajorName = "";
    this.closeAddMajorModal();
  }

  onCaptchaVerified(token: string): void {
    this.captchaToken.set(token);
  }

  onCaptchaExpired(): void {
    this.captchaToken.set(null);
  }

  async onSubmit(form: NgForm): Promise<void> {
    if (form.invalid || !this.captchaToken()) return;

    const { name, email, password, confirmPassword, major } = form.value;
    const mismatch = password !== confirmPassword;
    this.passwordMismatch.set(mismatch);

    if (mismatch) return;

    const createUser = await this.firebaseService.userSignUp(email, password);
    if (!createUser) return;

    if (this.pendingNewMajor) {
      const addMajor = await this.firebaseService.addMajor(this.pendingNewMajor);

      if (!addMajor) return;
      this.pendingNewMajor = "";
    }

    const setName = await this.firebaseService.setUserName(name);
    if (!setName) return;

    const saveProfile = await this.firebaseService.createUserProfile(name, email, major);
    if (!saveProfile) return;

    await this.router.navigateByUrl('/');
  }
}