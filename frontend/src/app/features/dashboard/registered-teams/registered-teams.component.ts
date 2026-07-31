import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';

const API_URL = 'http://localhost:3010/api/v1';

export interface AuditRegistrationItem {
  id: string;
  name: string;
  domain: string;
  billingPlan: string;
  isActive: boolean;
  createdAt: string;
  headUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    createdAt?: string;
  } | null;
  userCount: number;
}

@Component({
  selector: 'app-registered-teams',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, MatRippleModule],
  templateUrl: './registered-teams.component.html',
  styleUrls: ['./registered-teams.component.scss'],
})
export class RegisteredTeamsComponent implements OnInit {
  private http = inject(HttpClient);

  loading = signal<boolean>(true);
  teams = signal<AuditRegistrationItem[]>([]);

  ngOnInit(): void {
    this.fetchRegisteredTeams();
  }

  fetchRegisteredTeams(): void {
    this.loading.set(true);
    this.http.get<AuditRegistrationItem[]>(`${API_URL}/organizations/audit-registrations`).subscribe({
      next: (res) => {
        this.teams.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load registered teams audit:', err);
        this.loading.set(false);
      },
    });
  }

  toggleTeamStatus(team: AuditRegistrationItem): void {
    const newStatus = !team.isActive;
    this.http
      .patch(`${API_URL}/organizations/${team.id}/status`, { isActive: newStatus })
      .subscribe({
        next: () => {
          this.teams.update((list) =>
            list.map((t) => (t.id === team.id ? { ...t, isActive: newStatus } : t)),
          );
        },
        error: (err) => console.error('Failed to update status:', err),
      });
  }
}
