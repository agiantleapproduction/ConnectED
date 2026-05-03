import { FirebaseService } from './../../services/firebase';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { NgHcaptchaModule } from 'ng-hcaptcha';
import { UserProfile, UserRole } from '../../models/user-profile';

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
  readonly selectedRole = signal<UserRole | null>(null);

  readonly majors = signal<string[]>([]);
  readonly departments = signal<string[]>([]);
  readonly showAddNewModal = signal(false);

  selectedMajor = "";
  selectedDepartment = "";

  newOptionName = "";
  pendingNewMajor = "";
  pendingNewDepartment = "";

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadMajors(), this.loadDepartments()]);
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

  private async loadDepartments(): Promise<void> {
    const snapshot = await this.firebaseService.getDepartments();
    if (!snapshot) return;

    const departmentNames = snapshot.docs
      .map((doc) => String(doc.data()["name"] ?? "").trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    this.departments.set(departmentNames);
  }

  selectRole(role: UserRole): void {
    this.selectedRole.set(role);
  }

  openAddNewModal(): void {
    this.newOptionName = "";
    this.showAddNewModal.set(true);
  }

  closeAddNewModal(): void {
    this.showAddNewModal.set(false);
  }

  async addNewFromModal(): Promise<void> {
    const role = this.selectedRole();
    const option = this.newOptionName.trim();
    if (!role || !option) return;

    const items = role == 'student' ? this.majors() : this.departments();
    const existing = items.find(
      (item) => item.toLowerCase() == option.toLowerCase()
    );

    if (existing) {
      if (role == 'student') {
        this.selectedMajor = existing;
      } else {
        this.selectedDepartment = existing;
      }
      this.closeAddNewModal();
      return;
    }

    if (role == 'student') {
      this.pendingNewMajor = option;
      this.majors.set([...this.majors(), option].sort((a, b) => a.localeCompare(b)));
      this.selectedMajor = option;
    } else {
      this.pendingNewDepartment = option;
      this.departments.set([...this.departments(), option].sort((a, b) => a.localeCompare(b)));
      this.selectedDepartment = option;
    }

    this.newOptionName = "";
    this.closeAddNewModal();
  }

  onCaptchaVerified(token: string): void {
    this.captchaToken.set(token);
  }

  onCaptchaExpired(): void {
    this.captchaToken.set(null);
  }

  async onSubmit(form: NgForm): Promise<void> {
    const role = this.selectedRole();
    if (!role || form.invalid || !this.captchaToken()) return;

    const { name, email, password, confirmPassword } = form.value;
    const mismatch = password !== confirmPassword;
    this.passwordMismatch.set(mismatch);

    if (mismatch) return;

    const major = role == 'student' ? this.selectedMajor : null;
    const department = role == 'teacher' ? this.selectedDepartment : null;
    if ((role == 'student' && !major) || (role == 'teacher' && !department)) return;

    const createUser = await this.firebaseService.userSignUp(email, password);
    if (!createUser) return;

    if (role == 'student' && this.pendingNewMajor) {
      const addMajor = await this.firebaseService.addMajor(this.pendingNewMajor);

      if (!addMajor) return;
      this.pendingNewMajor = "";
    }

    if (role == 'teacher' && this.pendingNewDepartment) {
      const addDepartment = await this.firebaseService.addDepartment(this.pendingNewDepartment);

      if (!addDepartment) return;
      this.pendingNewDepartment = "";
    }

    const setName = await this.firebaseService.setUserName(name);
    if (!setName) return;

    const profile: UserProfile = { name, email, role, major, department };
    const saveProfile = await this.firebaseService.createUserProfile(profile);
    if (!saveProfile) return;

    await this.router.navigateByUrl('/');
  }
}