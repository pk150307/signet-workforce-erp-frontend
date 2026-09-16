import { Component, OnInit, computed, inject, signal, DestroyRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { SalaryRegisterService } from '../../../../core/services/salary-register.service';
import { PayrollFilterService } from '../../../../core/services/payroll-filter.service';
import { ClientsService } from '../../../../core/services/clients.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ALL_PAGE_SIZE, CursorPaginatedResult } from '../../../../core/models/api.models';
import { emptyCursorPage } from '../../../../core/utils/cursor-pagination.util';
import {
  SalaryRegisterListItem,
  SalaryRegisterStatus,
} from '../../../../core/models/salary-register.models';
import { ClientListItem } from '../../../../core/models/client.models';
import { featureDropdownDialogConfig } from '../../../../core/utils/dialog.util';
import {
  SALARY_REGISTER_MONTHS,
  SALARY_REGISTER_STATUS_OPTIONS,
  salaryRegisterMonthLabel,
  salaryRegisterStatusLabel,
} from '../salary-register.constants';
import {
  SalaryRegisterGenerateDialogComponent,
  SalaryRegisterGenerateDialogResult,
} from '../salary-register-generate-dialog/salary-register-generate-dialog.component';

@Component({
  selector: 'app-salary-register-list',
  templateUrl: './salary-register-list.component.html',
  styleUrl: './salary-register-list.component.less',
})
export class SalaryRegisterListComponent implements OnInit {
  private readonly salaryRegisterService = inject(SalaryRegisterService);
  private readonly payrollFilter = inject(PayrollFilterService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly clientsService = inject(ClientsService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  readonly router = inject(Router);

  readonly loading = signal(true);
  readonly generating = signal(false);
  readonly data = signal<CursorPaginatedResult<SalaryRegisterListItem> | null>(null);
  readonly clients = signal<ClientListItem[]>([]);

  readonly months = SALARY_REGISTER_MONTHS;
  readonly years = this.buildYearOptions();
  readonly statusOptions = SALARY_REGISTER_STATUS_OPTIONS;
  readonly statusLabel = salaryRegisterStatusLabel;
  readonly monthLabel = salaryRegisterMonthLabel;

  readonly monthOptions = computed(() =>
    this.months.map(m => ({ key: String(m.value), value: m.label })),
  );

  readonly yearOptions = computed(() =>
    this.years.map(y => ({ key: String(y), value: String(y) })),
  );

  readonly clientOptions = computed(() => [
    { key: '', value: 'All Clients' },
    ...this.clients().map(c => ({ key: String(c.id), value: c.companyName })),
  ]);

  readonly searchCtrl = new FormControl('');
  readonly monthCtrl = new FormControl<number | null>(this.payrollFilter.month());
  readonly yearCtrl = new FormControl<number | null>(this.payrollFilter.year());
  readonly clientCtrl = new FormControl<string | null>(this.payrollFilter.clientId());
  readonly statusCtrl = new FormControl<SalaryRegisterStatus | null>(null);

  ngOnInit() {
    this.payrollFilter.bindControls(
      { month: this.monthCtrl, year: this.yearCtrl, clientId: this.clientCtrl },
      this.destroyRef,
      () => this.loadData(),
    );

    this.loadData();

    this.clientsService.getAllForSelect().subscribe({
      next: clients => this.clients.set(clients),
      error: () => this.notification.warning('Could not load clients.'),
    });

    this.searchCtrl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.loadData();
    });

    this.statusCtrl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.loadData();
    });
  }

  loadData() {
    this.loading.set(true);

    this.salaryRegisterService.getAll({ ...this.currentQuery(), pageSize: ALL_PAGE_SIZE }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.data.set(emptyCursorPage(ALL_PAGE_SIZE));
        this.loading.set(false);
        this.notification.error('Failed to load salary registers.');
      },
    });
  }

  setStatusFilter(status: SalaryRegisterStatus | null) {
    this.statusCtrl.setValue(status);
  }

  viewRegister(id: string) {
    this.router.navigate(['/payroll/salary-register', id]);
  }

  openGenerateDialog() {
    this.dialog.open(
      SalaryRegisterGenerateDialogComponent,
      featureDropdownDialogConfig({
        width: '480px',
        data: {
          clientId: this.clientCtrl.value || this.payrollFilter.clientId(),
          month: this.monthCtrl.value ?? this.payrollFilter.month(),
          year: this.yearCtrl.value ?? this.payrollFilter.year(),
          clients: this.clients(),
        },
      }),
    ).afterClosed().subscribe((result?: SalaryRegisterGenerateDialogResult) => {
      if (!result) return;
      this.generating.set(true);
      this.salaryRegisterService.generate(result).subscribe({
        next: (detail) => {
          this.generating.set(false);
          this.notification.success('Salary register generated.');
          this.router.navigate(['/payroll/salary-register', detail.id]);
        },
        error: (err) => {
          this.generating.set(false);
          const msg =
            err?.error?.detail ?? err?.error?.message ?? 'Failed to generate salary register.';
          this.notification.error(msg);
          this.loadData();
        },
      });
    });
  }

  clearFilters() {
    this.searchCtrl.setValue('', { emitEvent: false });
    this.statusCtrl.setValue(null, { emitEvent: false });
    this.payrollFilter.resetAll();
  }

  private currentQuery() {
    const monthRaw = this.monthCtrl.value;
    const yearRaw = this.yearCtrl.value;
    return {
      search: this.searchCtrl.value || undefined,
      month: monthRaw != null && monthRaw !== ('' as unknown) ? Number(monthRaw) : undefined,
      year: yearRaw != null && yearRaw !== ('' as unknown) ? Number(yearRaw) : undefined,
      clientId: this.clientCtrl.value || undefined,
      status: this.statusCtrl.value ?? undefined,
    };
  }

  private buildYearOptions(): number[] {
    const y = this.payrollFilter.year();
    return [y - 1, y, y + 1];
  }
}
