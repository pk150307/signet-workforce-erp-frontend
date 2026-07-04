import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { PayrollService } from '../../../core/services/payroll.service';
import { PayrollFilterService } from '../../../core/services/payroll-filter.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PayrollRunListItem, PayrollRunStatus, PAYROLL_STATUS_LABELS } from '../../../core/models/payroll.models';
import { CursorPageParams } from '../../../core/models/api.models';
import {
  CursorPaginationState,
  isInvalidCursorError,
  resolvePaginationNavigate,
} from '../../../core/utils/cursor-pagination.util';
import { PaginationNavigateEvent } from '../../../library/components/pagination/pagination.component';

@Component({
  selector: 'app-payroll-runs',
  templateUrl: './payroll-runs.component.html',
  styleUrl: './payroll-runs.component.less',
})
export class PayrollRunsComponent implements OnInit {
  private readonly payrollService = inject(PayrollService);
  private readonly payrollFilter = inject(PayrollFilterService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notification = inject(NotificationService);
  readonly router = inject(Router);

  readonly loading = signal(true);
  readonly processing = signal(false);
  readonly runs = signal<PayrollRunListItem[]>([]);
  readonly pager = new CursorPaginationState();
  readonly displayedColumns = ['period', 'employees', 'gross', 'net', 'status', 'processed'];

  readonly months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i, 1).toLocaleString('en', { month: 'long' }),
  }));
  readonly years = [2024, 2025, 2026, 2027];

  readonly monthOptions = computed(() =>
    this.months.map(m => ({ key: String(m.value), value: m.label })),
  );

  readonly yearOptions = computed(() =>
    this.years.map(y => ({ key: String(y), value: String(y) })),
  );

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

  loadRuns(params?: CursorPageParams) {
    this.loading.set(true);
    const pageParams = params ?? this.pager.firstPageParams();
    this.payrollService.listRuns(pageParams).pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: result => {
        this.runs.set(result.items);
        this.pager.apply(result.pagination);
      },
      error: (err) => {
        if (isInvalidCursorError(err)) {
          this.pager.reset();
          this.loadRuns(this.pager.firstPageParams());
          return;
        }
        this.runs.set([]);
        this.pager.reset();
        this.notification.error('Failed to load payroll runs.');
      },
    });
  }

  onPaginationNavigate(event: PaginationNavigateEvent) {
    const p = resolvePaginationNavigate(this.pager, event);
    if (p) this.loadRuns(p);
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
        this.pager.reset();
        this.loadRuns(this.pager.firstPageParams());
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
