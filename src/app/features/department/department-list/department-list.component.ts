import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { DepartmentService } from '../../../core/services/department.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DepartmentListItem } from '../../../core/models/department.models';
import { PaginatedResult } from '../../../core/models/api.models';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
  ],
  templateUrl: './department-list.component.html',
  styleUrl: './department-list.component.less',
})
export class DepartmentListComponent implements OnInit {

  private readonly departmentService = inject(DepartmentService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly data = signal<PaginatedResult<DepartmentListItem> | null>(null);
  readonly viewMode = signal<'table' | 'hierarchy'>('table');
  readonly searchCtrl = new FormControl('');
  readonly statusCtrl = new FormControl<boolean | null>(null);
  readonly cols = ['departmentCode', 'departmentName', 'parentDepartmentName', 'headOfDepartment', 'employeeCount', 'status', 'actions'];

  page = 1;
  pageSize = 20;

  ngOnInit() {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.load();
    });
    this.statusCtrl.valueChanges.subscribe(() => {
      this.page = 1;
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.departmentService.getAll({
      page: this.page,
      pageSize: this.pageSize,
      search: this.searchCtrl.value || undefined,
      isActive: this.statusCtrl.value ?? undefined,
    }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.load();
  }

  editDepartment(id: string) {
    this.router.navigate(['/departments', id, 'edit']);
  }

  deleteDepartment(dept: DepartmentListItem) {
    if (!confirm(`Delete department "${dept.departmentName}"?`)) return;
    this.departmentService.delete(dept.id).subscribe({
      next: () => {
        this.notification.success('Department deleted.');
        this.load();
      },
      error: () => this.notification.error('Failed to delete department.'),
    });
  }

  clearFilters() {
    this.searchCtrl.setValue('');
    this.statusCtrl.setValue(null);
  }
}
