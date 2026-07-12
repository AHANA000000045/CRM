import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000/api/v1';

export interface Deal {
  _id: string;
  name: string;
  amount: number;
  stage: string;
  probability: number;
  expectedCloseDate?: string;
  customerId: {
    _id: string;
    name: string;
  };
  ownerId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DealsService {
  private http = inject(HttpClient);

  getDeals(): Observable<Deal[]> {
    return this.http.get<Deal[]>(`${API_URL}/deals`);
  }

  createDeal(dealData: any): Observable<Deal> {
    return this.http.post<Deal>(`${API_URL}/deals`, dealData);
  }

  updateDeal(id: string, dealData: Partial<Deal>): Observable<Deal> {
    return this.http.patch<Deal>(`${API_URL}/deals/${id}`, dealData);
  }
}
