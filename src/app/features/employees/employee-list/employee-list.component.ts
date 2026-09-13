import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { EmployeeService } from '../../../core/services/employee.service';
import { ClientsService } from '../../../core/services/clients.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ClientListItem } from '../../../core/models/client.models';
import {
  EmployeeListItem, EmployeeStatus, EmploymentType,
  EMPLOYEE_STATUS_LABELS, EMPLOYMENT_TYPE_LABELS
} from '../../../core/models/employee.models';
import { CursorPageParams, CursorPaginatedResult } from '../../../core/models/api.models';
import {
  CursorPaginationState,
  emptyCursorPage,
  isInvalidCursorError,
  resolvePaginationNavigate,
} from '../../../core/utils/cursor-pagination.util';
import { PaginationNavigateEvent } from '../../../library/components/pagination/pagination.component';
import { featureDropdownDialogConfig } from '../../../core/utils/dialog.util';
import { EmployeeMarkLeftDialogComponent } from '../components/employee-mark-left-dialog/employee-mark-left-dialog.component';
import { EmployeeRejoinDialogComponent } from '../components/employee-rejoin-dialog/employee-rejoin-dialog.component';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.less',
})
export class EmployeeListComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly clientsService = inject(ClientsService);
  private readonly notification = inject(NotificationService);
  readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly apiUnavailable = signal(false);
  readonly data = signal<CursorPaginatedResult<EmployeeListItem> | null>(null);
  readonly clients = signal<ClientListItem[]>([]);
  readonly pager = new CursorPaginationState();

  readonly searchCtrl = new FormControl('');
  readonly clientCtrl = new FormControl<string>('');
  readonly statusCtrl = new FormControl<EmployeeStatus | 'all'>(EmployeeStatus.Active);
  readonly employmentTypeCtrl = new FormControl<string>('');

  readonly displayedColumns = ['employeeCode', 'fullName', 'department', 'designation', 'site', 'status', 'joiningDate', 'actions'];

  readonly clientOptions = computed(() => [
    { key: '', value: 'All clients' },
    ...this.clients().map(c => ({ key: String(c.id), value: c.companyName })),
  ]);

  readonly statusFilterOptions = computed(() => [
    { key: 'all', value: 'All Statuses' },
    ...Object.entries(EMPLOYEE_STATUS_LABELS).map(([k, v]) => ({ key: k, value: v })),
  ]);

  readonly employmentTypeFilterOptions = computed(() => [
    { key: '', value: 'All Types' },
    ...Object.entries(EMPLOYMENT_TYPE_LABELS).map(([k, v]) => ({ key: k, value: v })),
  ]);

  readonly statusLabels: Record<number, string> = EMPLOYEE_STATUS_LABELS as Record<number, string>;

  sortBy = 'CreatedAt';
  sortDir: 'asc' | 'desc' = 'desc';

  ngOnInit() {
    this.clientsService.getAllForSelect().subscribe({
      next: list => this.clients.set(list),
      error: () => this.clients.set([]),
    });

    this.loadData();

    this.searchCtrl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(() => this.reloadFirstPage());

    this.clientCtrl.valueChanges.subscribe(() => this.reloadFirstPage());
    this.statusCtrl.valueChanges.subscribe(() => this.reloadFirstPage());
    this.employmentTypeCtrl.valueChanges.subscribe(() => this.reloadFirstPage());
  }

  loadData(params?: CursorPageParams) {
    this.loading.set(true);
    const pageParams = params ?? this.pager.firstPageParams();

    this.employeeService.getAll({
      ...pageParams,
      search: this.searchCtrl.value || undefined,
      clientId: this.clientCtrl.value || undefined,
      status: this.statusCtrl.value === 'all'
        ? 'all'
        : (this.statusCtrl.value ?? EmployeeStatus.Active),
      employmentType: this.employmentTypeCtrl.value
        ? (Number(this.employmentTypeCtrl.value) as EmploymentType)
        : undefined,
      sortBy: this.sortBy,
      sortDir: this.sortDir,
    }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.pager.apply(result.pagination);
        this.apiUnavailable.set(false);
        this.loading.set(false);
      },
      error: (err) => {
        if (isInvalidCursorError(err)) {
          this.pager.reset();
          this.loadData(this.pager.firstPageParams());
          return;
        }
        this.apiUnavailable.set(true);
        this.data.set(emptyCursorPage(this.pager.pageSize));
        this.pager.reset();
        this.loading.set(false);
      },
    });
  }

  onPaginationNavigate(event: PaginationNavigateEvent) {
    const p = resolvePaginationNavigate(this.pager, event);
    if (p) this.loadData(p);
  }

  private reloadFirstPage() {
    this.pager.reset();
    this.loadData(this.pager.firstPageParams());
  }

  toggleSort(active: string) {
    if (this.sortBy === active) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = active;
      this.sortDir = 'asc';
    }
    this.reloadFirstPage();
  }

  sortIcon(active: string): string {
    if (this.sortBy !== active) return 'unfold_more';
    return this.sortDir === 'desc' ? 'arrow_downward' : 'arrow_upward';
  }

  viewEmployee(id: string) {
    this.router.navigate(['/employees', id]);
  }

  exportExcel() {
    this.employeeService.exportExcel().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employees-export.xlsx';
        a.click();
        URL.revokeObjectURL(url);
        this.notification.success('Excel export downloaded.');
      },
      error: () => this.notification.error('Export failed.'),
    });
  }

  exportPdf() {
    this.employeeService.exportPdf().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employees-export.pdf';
        a.click();
        URL.revokeObjectURL(url);
        this.notification.success('PDF export downloaded.');
      },
      error: () => this.notification.error('Export failed.'),
    });
  }

  editEmployee(id: string) {
    this.router.navigate(['/employees', id, 'edit']);
  }

  canMarkLeft(status: EmployeeStatus): boolean {
    return status === EmployeeStatus.Active || status === EmployeeStatus.Rejoined;
  }

  canRejoin(status: EmployeeStatus): boolean {
    return status === EmployeeStatus.Left;
  }

  openMarkLeftDialog(emp: EmployeeListItem) {
    this.dialog.open(EmployeeMarkLeftDialogComponent, featureDropdownDialogConfig({
      width: '480px',
      data: { employee: emp },
    })).afterClosed().subscribe(changed => {
      if (changed) this.loadData(this.pager.currentPageParams());
    });
  }

  openRejoinDialog(emp: EmployeeListItem) {
    this.dialog.open(EmployeeRejoinDialogComponent, featureDropdownDialogConfig({
      width: '480px',
      data: { employee: emp },
    })).afterClosed().subscribe(changed => {
      if (changed) this.loadData(this.pager.currentPageParams());
    });
  }

  getStatusClass(status: EmployeeStatus): string {
    const map: Record<EmployeeStatus, string> = {
      [EmployeeStatus.Draft]: 'draft',
      [EmployeeStatus.Active]: 'active',
      [EmployeeStatus.Left]: 'inactive',
      [EmployeeStatus.Rejoined]: 'onleave',
    };
    return map[status] ?? 'draft';
  }

  clearFilters() {
    this.searchCtrl.setValue('');
    this.clientCtrl.setValue('');
    this.statusCtrl.setValue(EmployeeStatus.Active);
    this.employmentTypeCtrl.setValue('');
  }

  hasNonDefaultFilters(): boolean {
    return !!(
      this.searchCtrl.value ||
      this.clientCtrl.value ||
      this.statusCtrl.value !== EmployeeStatus.Active ||
      this.employmentTypeCtrl.value
    );
  }
}
