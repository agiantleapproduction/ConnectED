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

  readonly majors = signal<string[]>([]);
  readonly departments = signal<string[]>([]);

  editName = '';
  editMajor = '';
  editDepartment = '';

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
