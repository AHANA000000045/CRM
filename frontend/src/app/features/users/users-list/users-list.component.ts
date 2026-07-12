import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsersService } from '../../../core/services/users.service';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatRippleModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent implements OnInit {
  private usersService = inject(UsersService);
  authService = inject(AuthService);
  private fb = inject(FormBuilder);

  users = signal<User[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Form expansion toggle
  showInviteForm = signal(false);

  // Invitation Form
  inviteForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['Sales Executive', [Validators.required]],
  });

  // Available roles for provisioning
  roles = [
    'Organization Admin',
    'Sales Manager',
    'Sales Executive',
    'Support Executive',
    'Marketing Executive',
  ];

  // Table columns definition
  displayedColumns = ['avatar', 'name', 'email', 'role', 'status', 'actions'];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load organization users.');
        this.isLoading.set(false);
      },
    });
  }

  toggleInviteForm(): void {
    this.showInviteForm.update((val) => !val);
    if (!this.showInviteForm()) {
      this.inviteForm.reset({ role: 'Sales Executive' });
    }
  }

  onSubmitInvite(): void {
    if (this.inviteForm.invalid) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.usersService.createUser(this.inviteForm.value).subscribe({
      next: (newUser) => {
        this.users.update((curr) => [...curr, newUser]);
        this.isSaving.set(false);
        this.successMessage.set(`Successfully invited ${newUser.firstName}!`);
        this.toggleInviteForm();
        // Clear message after 3s
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to provision user.');
      },
    });
  }

  toggleUserStatus(user: User, event: any): void {
    const newStatus = event.checked;
    this.usersService.updateUserStatus(user.id, newStatus).subscribe({
      next: () => {
        this.users.update((curr) =>
          curr.map((u) => (u.id === user.id ? { ...u, isActive: newStatus } : u))
        );
      },
      error: (err) => {
        // Revert UI toggle on error
        event.source.checked = !newStatus;
        this.errorMessage.set(err.error?.message || 'Failed to update user status.');
        setTimeout(() => this.errorMessage.set(null), 3000);
      },
    });
  }

  // Check if caller can modify user administration
  canManageUsers(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'Super Admin' || role === 'Organization Admin';
  }
}
