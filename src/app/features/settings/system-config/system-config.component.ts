import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { SettingsService } from '../../../core/services/settings.service';
import { NotificationService } from '../../../core/services/notification.service';
@Component({
  selector: 'app-system-config',
    templateUrl: './system-config.component.html',
  styleUrl: './system-config.component.less',
})
export class SystemConfigComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly timezoneOptions = computed(() => [
    { key: 'Asia/Kolkata', value: 'Asia/Kolkata (IST)' },
    { key: 'Asia/Dubai', value: 'Asia/Dubai (GST)' },
  ]);

  readonly dateFormatOptions = computed(() => [
    { key: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
    { key: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
  ]);

  readonly currencyOptions = computed(() => [
    { key: 'INR', value: 'INR (₹)' },
  ]);

  readonly fiscalYearStartOptions = computed(() => [
    { key: 'April', value: 'April' },
    { key: 'January', value: 'January' },
  ]);

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
