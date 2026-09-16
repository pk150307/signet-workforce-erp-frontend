import { Component, OnInit, computed, inject, signal, DestroyRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { EmployeeAdvancesService } from '../../../../core/services/employee-advances.service';
import { PayrollFilterService } from '../../../../core/services/payroll-filter.service';
import { ClientsService } from '../../../../core/services/clients.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ALL_PAGE_SIZE, CursorPaginatedResult } from '../../../../core/models/api.models';
import { emptyCursorPage } from '../../../../core/utils/cursor-pagination.util';
import {
  EmployeeAdvanceListItem,
  EmployeeAdvanceStatus,
} from '../../../../core/models/employee-advances.models';
import { ClientListItem } from '../../../../core/models/client.models';
import { featureDropdownDialogConfig } from '../../../../core/utils/dialog.util';
import {
  EMPLOYEE_ADVANCE_MONTHS,
  EMPLOYEE_ADVANCE_STATUS_OPTIONS,
  employeeAdvanceMonthLabel,
  employeeAdvanceStatusLabel,
} from '../employee-advances.constants';
import {
  EmployeeAdvancesGenerateDialogComponent,
  EmployeeAdvancesGenerateDialogResult,
} from '../employee-advances-generate-dialog/employee-advances-generate-dialog.component';

@Component({
  selector: 'app-employee-advances-list',
  templateUrl: './employee-advances-list.component.html',
  styleUrl: './employee-advances-list.component.less',
})
export class EmployeeAdvancesListComponent implements OnInit {
  private readonly advancesService = inject(EmployeeAdvancesService);
  private readonly payrollFilter = inject(PayrollFilterService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly clientsService = inject(ClientsService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  readonly router = inject(Router);

  readonly loading = signal(true);
  readonly generating = signal(false);
  readonly data = signal<CursorPaginatedResult<EmployeeAdvanceListItem> | null>(null);
  readonly clients = signal<ClientListItem[]>([]);

  readonly months = EMPLOYEE_ADVANCE_MONTHS;
  readonly years = this.buildYearOptions();
  readonly statusOptions = EMPLOYEE_ADVANCE_STATUS_OPTIONS;
  readonly statusLabel = employeeAdvanceStatusLabel;
  readonly monthLabel = employeeAdvanceMonthLabel;

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
  readonly statusCtrl = new FormControl<EmployeeAdvanceStatus | null>(null);

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
    this.statusCtrl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadData());
  }

  loadData() {
    this.loading.set(true);
    this.advancesService.getAll({ ...this.currentQuery(), pageSize: ALL_PAGE_SIZE }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.data.set(emptyCursorPage(ALL_PAGE_SIZE));
        this.loading.set(false);
        this.notification.error('Failed to load employee advances.');
      },
    });
  }

  setStatusFilter(status: EmployeeAdvanceStatus | null) {
    this.statusCtrl.setValue(status);
  }

  viewRegister(id: string) {
    this.router.navigate(['/payroll/employee-advances', id]);
  }

  openGenerateDialog() {
    this.dialog.open(
      EmployeeAdvancesGenerateDialogComponent,
      featureDropdownDialogConfig({
        width: '480px',
        data: {
          clientId: this.clientCtrl.value || this.payrollFilter.clientId(),
          month: this.monthCtrl.value ?? this.payrollFilter.month(),
          year: this.yearCtrl.value ?? this.payrollFilter.year(),
          clients: this.clients(),
        },
      }),
    ).afterClosed().subscribe((result?: EmployeeAdvancesGenerateDialogResult) => {
      if (!result) return;
      this.generating.set(true);
      this.advancesService.generate(result).subscribe({
        next: (detail) => {
          this.generating.set(false);
          this.notification.success('Employee advance register generated.');
          this.router.navigate(['/payroll/employee-advances', detail.id]);
        },
        error: (err) => {
          this.generating.set(false);
          this.notification.error(
            err?.error?.detail ?? err?.error?.message ?? 'Failed to generate advance register.',
          );
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
