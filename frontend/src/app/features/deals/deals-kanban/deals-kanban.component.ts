import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DealsService, Deal } from '../../../core/services/deals.service';

@Component({
  selector: 'app-deals-kanban',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatRippleModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './deals-kanban.component.html',
  styleUrls: ['./deals-kanban.component.scss'],
})
export class DealsKanbanComponent implements OnInit {
  private dealsService = inject(DealsService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Available stages in order
  stages: string[] = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

  // Map storing list of deals per stage
  boardData: { [key: string]: Deal[] } = {
    'Prospecting': [],
    'Qualification': [],
    'Proposal': [],
    'Negotiation': [],
    'Closed Won': [],
    'Closed Lost': [],
  };

  ngOnInit(): void {
    this.loadDeals();
  }

  loadDeals(): void {
    this.isLoading.set(true);
    this.dealsService.getDeals().subscribe({
      next: (data) => {
        // Clear old lists
        this.stages.forEach((stage) => (this.boardData[stage] = []));
        // Distribute deals
        data.forEach((deal) => {
          if (this.boardData[deal.stage]) {
            this.boardData[deal.stage].push(deal);
          } else {
            this.boardData['Prospecting'].push(deal);
          }
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load deals pipeline.');
        this.isLoading.set(false);
      },
    });
  }

  onDrop(event: CdkDragDrop<Deal[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const deal = event.previousContainer.data[event.previousIndex];
      const newStage = event.container.id;

      // Optimistically transfer in UI
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Save to database
      this.dealsService.updateDeal(deal._id, { stage: newStage }).subscribe({
        next: (updatedDeal) => {
          // Sync probability locally
          deal.probability = updatedDeal.probability;
          deal.stage = updatedDeal.stage;
        },
        error: () => {
          // Revert transfer on database write failure
          this.loadDeals();
          this.errorMessage.set('Failed to update deal stage. Reverting changes.');
          setTimeout(() => this.errorMessage.set(null), 3000);
        },
      });
    }
  }

  // Calculate sum of deal values in a column
  getColumnTotal(stage: string): number {
    return this.boardData[stage]?.reduce((sum, deal) => sum + deal.amount, 0) || 0;
  }
}
