import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { AuthService } from '../../core/auth/auth.service';

export interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  defaultView: 'dashboard' | 'leads' | 'deals';
}

@Component({
  selector: 'app-settings',
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
    MatSlideToggleModule,
    MatRadioModule,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);

  settings = signal<UserSettings | null>(null);
  settingsForm!: FormGroup;
  successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadSettings();
    this.initForm();
  }

  loadSettings(): void {
    const cached = localStorage.getItem('flowcrm_user_settings');
    if (cached) {
      this.settings.set(JSON.parse(cached));
    } else {
      const defaultSettings: UserSettings = {
        emailNotifications: true,
        pushNotifications: true,
        weeklyDigest: false,
        defaultView: 'dashboard',
      };
      localStorage.setItem('flowcrm_user_settings', JSON.stringify(defaultSettings));
      this.settings.set(defaultSettings);
    }
  }

  initForm(): void {
    const current = this.settings();
    this.settingsForm = this.fb.group({
      emailNotifications: [current?.emailNotifications ?? true],
      pushNotifications: [current?.pushNotifications ?? true],
      weeklyDigest: [current?.weeklyDigest ?? false],
      defaultView: [current?.defaultView ?? 'dashboard'],
    });
  }

  onSubmit(): void {
    const updated: UserSettings = {
      ...this.settingsForm.value,
    };
    localStorage.setItem('flowcrm_user_settings', JSON.stringify(updated));
    this.settings.set(updated);
    this.showToast('Preferences saved successfully.');
  }

  private showToast(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 3000);
  }
}
