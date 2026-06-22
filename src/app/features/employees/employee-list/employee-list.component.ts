import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { NgClass, NgFor, NgIf, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  EmployeeListItem, EmployeeStatus, EmploymentType,
  EMPLOYEE_STATUS_LABELS, EMPLOYMENT_TYPE_LABELS
} from '../../../core/models/employee.models';
import { PaginatedResult } from '../../../core/models/api.models';
import { SafeDatePipe } from '../../../shared/pipes/safe-date.pipe';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { featureDialogConfig } from '../../../core/utils/dialog.util';
import { EmployeeMarkLeftDialogComponent } from '../components/employee-mark-left-dialog/employee-mark-left-dialog.component';
import { EmployeeRejoinDialogComponent } from '../components/employee-rejoin-dialog/employee-rejoin-dialog.component';
@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    SkeletonLoaderComponent,
    NgIf,
    NgFor,
    NgClass,
    SafeDatePipe,
    DecimalPipe,
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.less',
})
export class EmployeeListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private readonly employeeService = inject(EmployeeService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly apiUnavailable = signal(false);
  readonly data = signal<PaginatedResult<EmployeeListItem> | null>(null);

  readonly searchCtrl = new FormControl('');
  readonly statusCtrl = new FormControl<EmployeeStatus | 'all'>(EmployeeStatus.Active);
  readonly employmentTypeCtrl = new FormControl<EmploymentType | null>(null);

  readonly displayedColumns = ['employeeCode', 'fullName', 'department', 'designation', 'site', 'status', 'joiningDate', 'actions'];

  readonly statusOptions = Object.entries(EMPLOYEE_STATUS_LABELS).map(([k, v]) => ({ value: +k, label: v }));
  readonly employmentTypeOptions = Object.entries(EMPLOYMENT_TYPE_LABELS).map(([k, v]) => ({ value: +k, label: v }));
  readonly statusLabels: Record<number, string> = EMPLOYEE_STATUS_LABELS as Record<number, string>;

  page = 1;
  pageSize = 20;
  sortBy = 'CreatedAt';
  sortDir: 'asc' | 'desc' = 'desc';

  ngOnInit() {
    this.loadData();

    this.searchCtrl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(() => { this.page = 1; this.loadData(); });

    this.statusCtrl.valueChanges.subscribe(() => { this.page = 1; this.loadData(); });
    this.employmentTypeCtrl.valueChanges.subscribe(() => { this.page = 1; this.loadData(); });
  }

  loadData() {
    this.loading.set(true);
    this.employeeService.getAll({
      page: this.page,
      pageSize: this.pageSize,
      search: this.searchCtrl.value || undefined,
      status: this.statusCtrl.value === 'all'
        ? 'all'
        : (this.statusCtrl.value ?? EmployeeStatus.Active),
      employmentType: this.employmentTypeCtrl.value ?? undefined,
      sortBy: this.sortBy,
      sortDir: this.sortDir,
    }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.apiUnavailable.set(true);
        this.data.set({ items: [], totalCount: 0, page: 1, pageSize: this.pageSize, totalPages: 0, hasPreviousPage: false, hasNextPage: false });
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  onSortChange(sort: { active: string; direction: 'asc' | 'desc' | '' }) {
    if (sort.direction) {
      this.sortBy = sort.active;
      this.sortDir = sort.direction;
    }
    this.loadData();
  }

  viewEmployee(id: string) {
    this.router.navigate(['/employees', id]);
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
    this.dialog.open(EmployeeMarkLeftDialogComponent, featureDialogConfig({
      width: '480px',
      data: { employee: emp },
    })).afterClosed().subscribe(changed => {
      if (changed) this.loadData();
    });
  }

  openRejoinDialog(emp: EmployeeListItem) {
    this.dialog.open(EmployeeRejoinDialogComponent, featureDialogConfig({
      width: '480px',
      data: { employee: emp },
    })).afterClosed().subscribe(changed => {
      if (changed) this.loadData();
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
    this.statusCtrl.setValue(EmployeeStatus.Active);
    this.employmentTypeCtrl.setValue(null);
  }

  hasNonDefaultFilters(): boolean {
    return !!(
      this.searchCtrl.value ||
      this.statusCtrl.value !== EmployeeStatus.Active ||
      this.employmentTypeCtrl.value
    );
  }
}
