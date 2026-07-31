import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3010/api/v1';

export interface BdeRecommendation {
  id: string;
  category: 'Revenue Protection' | 'Opportunity Growth' | 'Team Optimization' | 'Customer Risk' | 'Pipeline Health';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  recommendation: string;
  reason: string;
  estimatedImpact: number;
  formattedImpact: string;
  confidenceScore: number;
  actionLabel: string;
  targetRoute: string;
}

export interface BdeSummary {
  healthScore: number;
  revenueAtRisk: number;
  opportunityValue: number;
  highPriorityCount: number;
  totalRecommendations: number;
  categoryCounts: Record<string, number>;
}

export interface BdeDecisionCenterResponse {
  summary: BdeSummary;
  recommendations: BdeRecommendation[];
}

@Injectable({
  providedIn: 'root',
})
export class BdeService {
  private http = inject(HttpClient);

  getDecisionCenter(): Observable<BdeDecisionCenterResponse> {
    return this.http.get<BdeDecisionCenterResponse>(`${API_URL}/bde/decision-center`);
  }
}
