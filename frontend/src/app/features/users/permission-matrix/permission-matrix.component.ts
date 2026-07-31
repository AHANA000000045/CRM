import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

const API_URL = 'http://localhost:3010/api/v1';

export interface UserPermissionItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  permissions: string[];
}

@Component({
  selector: 'app-permission-matrix',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatTooltipModule],
  templateUrl: './permission-matrix.component.html',
  styleUrls: ['./permission-matrix.component.scss'],
})
export class PermissionMatrixComponent implements OnInit {
  private http = inject(HttpClient);

  loading = signal<boolean>(true);
  users = signal<UserPermissionItem[]>([]);

  permissionKeys = [
    { key: 'leads:read', label: 'View Leads' },
    { key: 'leads:write', label: 'Manage Leads' },
    { key: 'deals:read', label: 'View Deals' },
    { key: 'deals:write', label: 'Manage Deals' },
    { key: 'bde:read', label: 'Decision Engine' },
    { key: 'users:manage', label: 'Manage Users' },
    { key: 'tasks:manage', label: 'Manage Tasks' },
  ];

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.loading.set(true);
    this.http.get<any[]>(`${API_URL}/users`).subscribe({
      next: (res) => {
        const mapped: UserPermissionItem[] = res.map((u) => ({
          id: u._id || u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
          isActive: u.isActive,
          permissions: u.permissions || [],
        }));
        this.users.set(mapped);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load users for permission matrix:', err);
        this.loading.set(false);
      },
    });
  }

  hasPerm(user: UserPermissionItem, permKey: string): boolean {
    if (user.role === 'Super Admin' || user.role === 'Organization Admin') return true;
    return user.permissions.includes(permKey);
  }

  togglePerm(user: UserPermissionItem, permKey: string): void {
    if (user.role === 'Super Admin' || user.role === 'Organization Admin') return;

    let updatedPerms: string[];
    if (user.permissions.includes(permKey)) {
      updatedPerms = user.permissions.filter((p) => p !== permKey);
    } else {
      updatedPerms = [...user.permissions, permKey];
    }

    this.http
      .patch(`${API_URL}/users/${user.id}/permissions`, { permissions: updatedPerms })
      .subscribe({
        next: () => {
          this.users.update((list) =>
            list.map((u) => (u.id === user.id ? { ...u, permissions: updatedPerms } : u)),
          );
        },
        error: (err) => console.error('Failed to update user permissions:', err),
      });
  }
}
