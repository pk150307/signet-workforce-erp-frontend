import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { NgClass, NgFor, NgIf, DatePipe, DecimalPipe } from '@angular/common';
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
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  EmployeeListItem, EmployeeStatus, EmploymentType,
  EMPLOYEE_STATUS_LABELS, EMPLOYMENT_TYPE_LABELS
} from '../../../core/models/employee.models';
import { PaginatedResult } from '../../../core/models/api.models';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
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
    MatDividerModule,
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

  readonly loading = signal(false);
  readonly data = signal<PaginatedResult<EmployeeListItem> | null>(null);

  readonly searchCtrl = new FormControl('');
  readonly statusCtrl = new FormControl<EmployeeStatus | null>(null);
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
      status: this.statusCtrl.value ?? undefined,
      employmentType: this.employmentTypeCtrl.value ?? undefined,
      sortBy: this.sortBy,
      sortDir: this.sortDir,
    }).subscribe({
      next: (result) => { this.data.set(result); this.loading.set(false); },
      error: () => this.loading.set(false)
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

  deleteEmployee(emp: EmployeeListItem) {
    if (!confirm(`Are you sure you want to delete ${emp.fullName}? This action cannot be undone.`)) return;

    this.employeeService.delete(emp.id).subscribe({
      next: () => {
        this.notification.success(`${emp.fullName} has been removed.`);
        this.loadData();
      },
      error: () => this.notification.error('Failed to delete employee.')
    });
  }

  getStatusClass(status: EmployeeStatus): string {
    const map: Record<number, string> = {
      1: 'active', 2: 'inactive', 3: 'onleave', 4: 'terminated', 5: 'inactive', 6: 'probation'
    };
    return map[status] ?? '';
  }

  clearFilters() {
    this.searchCtrl.setValue('');
    this.statusCtrl.setValue(null);
    this.employmentTypeCtrl.setValue(null);
  }
}
