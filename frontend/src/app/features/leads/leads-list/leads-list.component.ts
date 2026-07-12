import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LeadsService, Lead } from '../../../core/services/leads.service';

@Component({
  selector: 'app-leads-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    MatRippleModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './leads-list.component.html',
  styleUrls: ['./leads-list.component.scss'],
})
export class LeadsListComponent implements OnInit {
  private leadsService = inject(LeadsService);
  private fb = inject(FormBuilder);

  leads = signal<Lead[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  isConverting = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Form toggle state
  showLeadForm = signal(false);

  // Creation Form
  leadForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    company: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    status: ['New', [Validators.required]],
    source: ['Website', [Validators.required]],
    estimatedValue: [0, [Validators.required, Validators.min(0)]],
    notes: [''],
  });

  statuses = ['New', 'Contacted', 'Qualified', 'Unqualified', 'Lost'];
  sources = ['Website', 'Referral', 'Cold Call', 'Social Media', 'Other'];

  displayedColumns = ['name', 'company', 'email', 'value', 'source', 'status', 'actions'];

  ngOnInit(): void {
    this.loadLeads();
  }

  loadLeads(): void {
    this.isLoading.set(true);
    this.leadsService.getLeads().subscribe({
      next: (data) => {
        this.leads.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load leads list.');
        this.isLoading.set(false);
      },
    });
  }

  toggleLeadForm(): void {
    this.showLeadForm.update((val) => !val);
    if (!this.showLeadForm()) {
      this.leadForm.reset({ status: 'New', source: 'Website', estimatedValue: 0 });
    }
  }

  onSubmitLead(): void {
    if (this.leadForm.invalid) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.leadsService.createLead(this.leadForm.value).subscribe({
      next: (newLead) => {
        this.leads.update((curr) => [...curr, newLead]);
        this.isSaving.set(false);
        this.successMessage.set(`Successfully created lead for ${newLead.firstName} ${newLead.lastName}!`);
        this.toggleLeadForm();
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to create lead.');
      },
    });
  }

  convertLead(lead: Lead): void {
    if (!lead._id || lead.status === 'Qualified') return;

    this.isConverting.set(lead._id);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.leadsService.convertLead(lead._id).subscribe({
      next: (res) => {
        // Update status locally
        this.leads.update((curr) =>
          curr.map((l) => (l._id === lead._id ? { ...l, status: 'Qualified' } : l))
        );
        this.isConverting.set(null);
        this.successMessage.set(
          `Successfully qualified lead! Created Customer account and Contact details. ${
            res.dealId ? 'A Deal was also created in your Pipeline.' : ''
          }`
        );
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.isConverting.set(null);
        this.errorMessage.set(err.error?.message || 'Failed to qualify lead.');
      },
    });
  }
}
