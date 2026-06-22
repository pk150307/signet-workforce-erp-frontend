import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { SettingsService } from '../../../core/services/settings.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-system-config',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    SkeletonLoaderComponent,
  ],
  templateUrl: './system-config.component.html',
  styleUrl: './system-config.component.less',
})
export class SystemConfigComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly form = this.fb.group({
    companyName: ['', Validators.required],
    timezone: ['Asia/Kolkata', Validators.required],
    dateFormat: ['DD/MM/YYYY', Validators.required],
    currency: ['INR', Validators.required],
    fiscalYearStart: ['April', Validators.required],
    sessionTimeoutMinutes: [30, [Validators.required, Validators.min(5)]],
    enableTwoFactor: [false],
    enableAuditLog: [true],
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.settingsService.getSystemConfig().subscribe({
      next: (config) => {
        this.form.patchValue(config);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.settingsService.saveSystemConfig(this.form.getRawValue() as never).subscribe({
      next: () => {
        this.notification.success('System configuration saved.');
        this.saving.set(false);
      },
      error: () => {
        this.notification.error('Failed to save configuration.');
        this.saving.set(false);
      },
    });
  }
}
