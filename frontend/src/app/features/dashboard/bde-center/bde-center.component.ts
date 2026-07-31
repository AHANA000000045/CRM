import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { BdeService, BdeDecisionCenterResponse, BdeRecommendation } from '../../../core/services/bde.service';

@Component({
  selector: 'app-bde-center',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatRippleModule,
  ],
  templateUrl: './bde-center.component.html',
  styleUrls: ['./bde-center.component.scss'],
})
export class BdeCenterComponent implements OnInit {
  private bdeService = inject(BdeService);
  private router = inject(Router);

  loading = signal<boolean>(true);
  data = signal<BdeDecisionCenterResponse | null>(null);
  activeCategory = signal<string>('ALL');

  categories = [
    { key: 'ALL', label: 'All Recommendations', icon: 'auto_awesome' },
    { key: 'Revenue Protection', label: 'Revenue Protection', icon: 'shield' },
    { key: 'Opportunity Growth', label: 'Opportunity Growth', icon: 'trending_up' },
    { key: 'Customer Risk', label: 'Customer Risk', icon: 'warning' },
    { key: 'Pipeline Health', label: 'Pipeline Health', icon: 'account_tree' },
    { key: 'Team Optimization', label: 'Team Optimization', icon: 'groups' },
  ];

  filteredRecommendations = computed(() => {
    const res = this.data();
    if (!res) return [];
    const cat = this.activeCategory();
    if (cat === 'ALL') return res.recommendations;
    return res.recommendations.filter((r) => r.category === cat);
  });

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading.set(true);
    this.bdeService.getDecisionCenter().subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load BDE Decision Center:', err);
        this.loading.set(false);
      },
    });
  }

  setCategory(catKey: string): void {
    this.activeCategory.set(catKey);
  }

  onTakeAction(rec: BdeRecommendation): void {
    if (rec.targetRoute) {
      this.router.navigateByUrl(rec.targetRoute);
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'Revenue Protection':
        return 'shield';
      case 'Opportunity Growth':
        return 'trending_up';
      case 'Customer Risk':
        return 'warning';
      case 'Pipeline Health':
        return 'account_tree';
      case 'Team Optimization':
        return 'groups';
      default:
        return 'auto_awesome';
    }
  }
}
