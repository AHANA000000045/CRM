import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, of } from 'rxjs';
import { AuthResponse, User } from '../models/user.model';

const API_URL = 'http://localhost:3000/api/v1';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Core Authentication Signals
  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    // Attempt auto-login if token exists on load
    this.autoLogin();
  }

  register(data: any): Observable<any> {
    return this.http.post(`${API_URL}/auth/register`, data);
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, credentials).pipe(
      tap((res) => {
        localStorage.setItem('token', res.accessToken);
        const mappedUser: User = {
          id: res.user.id,
          email: res.user.email,
          firstName: res.user.firstName,
          lastName: res.user.lastName,
          role: res.user.role,
          isActive: true,
        };
        this.currentUser.set(mappedUser);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  loadProfile(): Observable<User> {
    return this.http.get<any>(`${API_URL}/auth/profile`).pipe(
      tap((res) => {
        const mappedUser: User = {
          id: res.id,
          email: res.email,
          firstName: res.firstName,
          lastName: res.lastName,
          role: res.role,
          isActive: res.isActive,
          organizationId: res.organization,
        };
        this.currentUser.set(mappedUser);
      }),
      catchError((err) => {
        this.logout();
        return throwError(() => err);
      }),
    );
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private autoLogin(): void {
    const token = this.getToken();
    if (token) {
      // Temporarily set a shell user so guards don't immediately redirect while loading
      this.currentUser.set({
        id: '',
        email: '',
        firstName: 'Loading',
        lastName: '...',
        role: 'Sales Executive',
        isActive: true,
      });
      this.loadProfile().subscribe({
        error: () => this.logout(),
      });
    }
  }
}
