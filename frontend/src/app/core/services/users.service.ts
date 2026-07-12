import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

const API_URL = 'http://localhost:3000/api/v1';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${API_URL}/users`);
  }

  createUser(userData: any): Observable<User> {
    return this.http.post<User>(`${API_URL}/users`, userData);
  }

  updateUserStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.patch<any>(`${API_URL}/users/${id}/status`, { isActive });
  }
}
