import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../services/firebase';
import { UserProfile } from '../../models/user-profile';

@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly firebaseService = inject(FirebaseService);

  readonly profile = signal<UserProfile | null>(null);
  readonly loading = signal(true);
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly saveSuccess = signal(false);
  readonly firestoreError = this.firebaseService.currentFirestoreError;
  readonly changingPassword = signal(false);
  readonly passwordSaving = signal(false);
  readonly passwordSuccess = signal(false);
  readonly passwordError = signal<string | null>(null);
  readonly changingEmail = signal(false);
  readonly emailSaving = signal(false);
  readonly emailSuccess = signal(false);
  readonly emailError = signal<string | null>(null);

  readonly majors = signal<string[]>([]);
  readonly departments = signal<string[]>([]);

  editName = '';
  editMajor = '';
  editDepartment = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  emailCurrentPassword = '';
  newEmail = '';

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadProfile(), this.loadMajors(), this.loadDepartments()]);
    this.loading.set(false);
  }

  private async loadProfile(): Promise<void> {
    const p = await this.firebaseService.getCurrentUserProfile();
    this.profile.set(p);
  }

  private async loadMajors(): Promise<void> {
    const snapshot = await this.firebaseService.getMajors();
    if (!snapshot) return;
    const names = snapshot.docs
      .map((d) => String(d.data()['name'] ?? '').trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    this.majors.set(names);
  }

  private async loadDepartments(): Promise<void> {
    const snapshot = await this.firebaseService.getDepartments();
    if (!snapshot) return;
    const names = snapshot.docs
      .map((d) => String(d.data()['name'] ?? '').trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    this.departments.set(names);
  }

  startEdit(): void {
    const p = this.profile();
    if (!p) return;
    this.editName = p.name;
    this.editMajor = p.major ?? '';
    this.editDepartment = p.department ?? '';
    this.saveSuccess.set(false);
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  async saveEdit(): Promise<void> {
    const p = this.profile();
    if (!p || this.saving()) return;

    const name = this.editName.trim();
    if (!name) return;

    this.saving.set(true);
    const updates: Partial<Pick<UserProfile, 'name' | 'major' | 'department'>> = { name };
    if (p.role === 'student') updates.major = this.editMajor || null;
    if (p.role === 'teacher') updates.department = this.editDepartment || null;

    const ok = await this.firebaseService.updateUserProfile(updates);
    this.saving.set(false);
    if (ok) {
      this.profile.set({ ...p, ...updates });
      this.editing.set(false);
      this.saveSuccess.set(true);
    }
  }

  startChangeEmail(): void {
    this.emailCurrentPassword = '';
    this.newEmail = '';
    this.emailError.set(null);
    this.emailSuccess.set(false);
    this.changingEmail.set(true);
  }

  cancelChangeEmail(): void {
    this.changingEmail.set(false);
  }

  async saveEmail(): Promise<void> {
    if (this.emailSaving()) return;
    if (!this.newEmail.includes('@')) {
      this.emailError.set('Please enter a valid email address.');
      return;
    }
    this.emailSaving.set(true);
    this.emailError.set(null);
    const ok = await this.firebaseService.changeEmail(this.emailCurrentPassword, this.newEmail);
    this.emailSaving.set(false);
    if (ok) {
      this.profile.update((p) => (p ? { ...p, email: this.newEmail } : p));
      this.emailSuccess.set(true);
      this.changingEmail.set(false);
    } else {
      const err = this.firebaseService.currentFirestoreError();
      this.emailError.set(err ?? 'Failed to change email.');
    }
  }

  startChangePassword(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError.set(null);
    this.passwordSuccess.set(false);
    this.changingPassword.set(true);
  }

  cancelChangePassword(): void {
    this.changingPassword.set(false);
  }

  async savePassword(): Promise<void> {
    if (this.passwordSaving()) return;
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('New passwords do not match.');
      return;
    }
    if (this.newPassword.length < 6) {
      this.passwordError.set('Password must be at least 6 characters.');
      return;
    }
    this.passwordSaving.set(true);
    this.passwordError.set(null);
    const ok = await this.firebaseService.changePassword(this.currentPassword, this.newPassword);
    this.passwordSaving.set(false);
    if (ok) {
      this.passwordSuccess.set(true);
      this.changingPassword.set(false);
    } else {
      const err = this.firebaseService.currentFirestoreError();
      this.passwordError.set(err ?? 'Failed to change password.');
    }
  }

  get initials(): string {
    const name = this.profile()?.name ?? '';
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');
  }

  get roleLabel(): string {
    return this.profile()?.role === 'teacher' ? 'Teacher' : 'Student';
  }
}
