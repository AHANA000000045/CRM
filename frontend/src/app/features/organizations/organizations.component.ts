import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/auth/auth.service';

export interface OrgDetails {
  name: string;
  industry: string;
  domain: string;
  subscriptionPlan: string;
  tenantId: string;
  createdAt: string;
  phone: string;
  address: string;
  departments: string[];
}

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatRippleModule,
    MatTooltipModule,
  ],
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
})
export class OrganizationsComponent implements OnInit {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);

  orgDetails = signal<OrgDetails | null>(null);
  isEditing = signal(false);
  orgForm!: FormGroup;
  successMessage = signal<string | null>(null);
  
  newDepartmentName = signal('');

  ngOnInit(): void {
    this.loadOrgDetails();
    this.initForm();
  }

  loadOrgDetails(): void {
    const cached = localStorage.getItem('flowcrm_org_details');
    if (cached) {
      this.orgDetails.set(JSON.parse(cached));
    } else {
      const orgIdVal = this.authService.currentUser()?.organizationId;
      const tenantId = typeof orgIdVal === 'object' && orgIdVal ? orgIdVal.id : (orgIdVal || 'org_68f731a57c2a492');

      const defaultOrg: OrgDetails = {
        name: 'Acme Software Corporation',
        industry: 'Cloud Software & SaaS',
        domain: 'acmesoftware.io',
        subscriptionPlan: 'Enterprise Premium Tier (Active)',
        tenantId: tenantId,
        createdAt: '2026-01-12',
        phone: '+1 (800) 555-0199',
        address: '100 Infinity Loop, Cupertino, CA 95014',
        departments: ['Sales', 'Marketing', 'Customer Success', 'Finance', 'Engineering'],
      };
      localStorage.setItem('flowcrm_org_details', JSON.stringify(defaultOrg));
      this.orgDetails.set(defaultOrg);
    }
  }

  initForm(): void {
    const details = this.orgDetails();
    this.orgForm = this.fb.group({
      name: [details?.name || '', [Validators.required]],
      industry: [details?.industry || ''],
      domain: [details?.domain || '', [Validators.required]],
      phone: [details?.phone || ''],
      address: [details?.address || ''],
    });
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      this.initForm(); // reset form to current values
    }
    this.isEditing.update((val) => !val);
  }

  onSubmit(): void {
    if (this.orgForm.invalid) return;

    const current = this.orgDetails();
    if (current) {
      const updated: OrgDetails = {
        ...current,
        ...this.orgForm.value,
      };
      localStorage.setItem('flowcrm_org_details', JSON.stringify(updated));
      this.orgDetails.set(updated);
      this.isEditing.set(false);
      this.showToast('Organization details updated successfully.');
    }
  }

  onNewDeptInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.newDepartmentName.set(val);
  }

  addDepartment(): void {
    const dept = this.newDepartmentName().trim();
    if (!dept) return;

    const current = this.orgDetails();
    if (current) {
      if (current.departments.includes(dept)) {
        this.showToast('Department already exists.');
        return;
      }
      const updated: OrgDetails = {
        ...current,
        departments: [...current.departments, dept],
      };
      localStorage.setItem('flowcrm_org_details', JSON.stringify(updated));
      this.orgDetails.set(updated);
      this.newDepartmentName.set('');
      this.showToast(`Department "${dept}" added successfully.`);
    }
  }

  removeDepartment(dept: string): void {
    const current = this.orgDetails();
    if (current) {
      const updated: OrgDetails = {
        ...current,
        departments: current.departments.filter((d) => d !== dept),
      };
      localStorage.setItem('flowcrm_org_details', JSON.stringify(updated));
      this.orgDetails.set(updated);
      this.showToast(`Department "${dept}" removed.`);
    }
  }

  private showToast(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 3000);
  }
}
