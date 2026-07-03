import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';

import { PayrollService } from '../../../core/services/payroll.service';
import { PayrollFilterService } from '../../../core/services/payroll-filter.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PayrollRunListItem, PayrollRunStatus, PAYROLL_STATUS_LABELS } from '../../../core/models/payroll.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ApiDatePipe } from '../../../shared/pipes/api-date.pipe';

@Component({
  selector: 'app-payroll-runs',
  standalone: true,
  imports: [
    NgIf, NgFor, NgClass, DecimalPipe, RouterLink, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule,
    MatTableModule, MatChipsModule, MatTooltipModule, SkeletonLoaderComponent, EmptyStateComponent, ApiDatePipe,
  ],
  templateUrl: './payroll-runs.component.html',
  styleUrl: './payroll-runs.component.less',
})
export class PayrollRunsComponent implements OnInit {
  private readonly payrollService = inject(PayrollService);
  private readonly payrollFilter = inject(PayrollFilterService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(true);
  readonly processing = signal(false);
  readonly runs = signal<PayrollRunListItem[]>([]);
  readonly displayedColumns = ['period', 'employees', 'gross', 'net', 'status', 'processed'];

  readonly months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i, 1).toLocaleString('en', { month: 'long' }),
  }));
  readonly years = [2024, 2025, 2026, 2027];

  readonly processForm = new FormGroup({
    month: new FormControl(this.payrollFilter.month(), { nonNullable: true, validators: Validators.required }),
    year: new FormControl(this.payrollFilter.year(), { nonNullable: true, validators: Validators.required }),
  });

  readonly latestRun = computed(() => this.runs()[0] ?? null);
  readonly processedCount = computed(() =>
    this.runs().filter(r => r.status >= PayrollRunStatus.Processing).length,
  );

  ngOnInit() {
    this.payrollFilter.bindControls(
      { month: this.processForm.controls.month, year: this.processForm.controls.year },
      this.destroyRef,
    );
    this.loadRuns();
  }

  loadRuns() {
    this.loading.set(true);
    this.payrollService.listRuns().pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: items => this.runs.set(items),
      error: () => this.notification.error('Failed to load payroll runs.'),
    });
  }

  processPayroll() {
    if (this.processForm.invalid || this.processing()) return;
    const { month, year } = this.processForm.getRawValue();

    this.processing.set(true);
    this.payrollService.process(month, year).pipe(
      finalize(() => this.processing.set(false)),
    ).subscribe({
      next: () => {
        this.notification.success(`Payroll for ${month}/${year} processed successfully.`);
        this.loadRuns();
      },
      error: (err) => {
        this.notification.error(err?.error?.message ?? err?.error?.title ?? 'Payroll processing failed.');
      },
    });
  }

  statusLabel(status: number): string {
    return PAYROLL_STATUS_LABELS[status] ?? 'Unknown';
  }

  statusClass(status: number): string {
    if (status >= PayrollRunStatus.Processed) return 'status--success';
    if (status === PayrollRunStatus.Processing) return 'status--warn';
    return 'status--muted';
  }

  isReadyForBilling(status: number): boolean {
    return status >= PayrollRunStatus.Processing;
  }

  formatCurrency(value: number): string {
    if (value >= 100000) return '₹' + (value / 100000).toFixed(1) + 'L';
    return '₹' + value.toLocaleString('en-IN');
  }
}
