import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000/api/v1';

export interface Lead {
  _id?: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone?: string;
  status: string;
  source: string;
  estimatedValue: number;
  notes?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LeadsService {
  private http = inject(HttpClient);

  getLeads(): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${API_URL}/leads`);
  }

  createLead(leadData: Partial<Lead>): Observable<Lead> {
    return this.http.post<Lead>(`${API_URL}/leads`, leadData);
  }

  updateLead(id: string, leadData: Partial<Lead>): Observable<Lead> {
    return this.http.patch<Lead>(`${API_URL}/leads/${id}`, leadData);
  }

  convertLead(id: string): Observable<{ customerId: string; contactId: string; dealId: string | null }> {
    return this.http.post<{ customerId: string; contactId: string; dealId: string | null }>(
      `${API_URL}/leads/${id}/convert`,
      {}
    );
  }
}
