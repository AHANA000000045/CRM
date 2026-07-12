import { Component, inject, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { AuthService } from '../../../core/auth/auth.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard-metrics',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatTooltipModule, MatRippleModule],
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss'],
})
export class MetricsComponent implements AfterViewInit {
  authService = inject(AuthService);

  @ViewChild('pipelineChart') pipelineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('leadChart') leadChartRef!: ElementRef<HTMLCanvasElement>;

  // Mock metrics data
  metrics = [
    { title: 'Total Revenue', value: '$1,248,500', change: '+12.5%', icon: 'payments', class: 'revenue' },
    { title: 'Active Leads', value: '142', change: '+8.2%', icon: 'leaderboard', class: 'leads' },
    { title: 'Win Probability', value: '68%', change: '+4.1%', icon: 'pie_chart', class: 'winrate' },
    { title: 'Deals Closed', value: '48', change: '+15.3%', icon: 'check_circle', class: 'deals' },
  ];

  // Mock CRM activities
  activities = [
    { user: 'Sarah Connor', action: 'moved deal "Acme Renewal" to Negotiation', time: '10 mins ago', type: 'deal' },
    { user: 'John Connor', action: 'logged a phone call with Bruce Wayne', time: '1 hour ago', type: 'call' },
    { user: 'Marcus Wright', action: 'created new lead "Cyberdyne Systems"', time: '3 hours ago', type: 'lead' },
    { user: 'Kyle Reese', action: 'marked task "Follow up proposal" as completed', time: '5 hours ago', type: 'task' },
  ];

  // Mock tasks
  tasks = [
    { id: 1, title: 'Review proposal with Wayne Enterprises', dueDate: 'Today, 4 PM', priority: 'High', done: false },
    { id: 2, title: 'Send billing contract to Stark Industries', dueDate: 'Tomorrow', priority: 'High', done: false },
    { id: 3, title: 'Update pipeline forecast with Sales Manager', dueDate: 'July 15', priority: 'Medium', done: false },
  ];

  ngAfterViewInit(): void {
    this.initCharts();
  }

  toggleTask(taskId: number): void {
    this.tasks = this.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
  }

  private initCharts(): void {
    // 1. Sales Pipeline Chart (Doughnut)
    if (this.pipelineChartRef) {
      new Chart(this.pipelineChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Won'],
          datasets: [
            {
              data: [30, 20, 25, 15, 10],
              backgroundColor: [
                '#3b82f6', // Prospecting
                '#6366f1', // Qualification
                '#a855f7', // Proposal
                '#f59e0b', // Negotiation
                '#10b981', // Won
              ],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: '#94a3b8',
                font: { family: 'Inter', size: 12 },
              },
            },
          },
        },
      });
    }

    // 2. Lead Ingestion Chart (Bar)
    if (this.leadChartRef) {
      new Chart(this.leadChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Incoming Leads',
              data: [65, 80, 85, 100, 90, 120],
              backgroundColor: '#3b82f6',
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#94a3b8' },
            },
            y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#94a3b8' },
            },
          },
        },
      });
    }
  }
}
