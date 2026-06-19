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

import { DesignationService } from '../../../core/services/designation.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DesignationListItem } from '../../../core/models/designation.models';
import { PaginatedResult } from '../../../core/models/api.models';

@Component({
  selector: 'app-designation-list',
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
  templateUrl: './designation-list.component.html',
  styleUrl: './designation-list.component.less',
})
export class DesignationListComponent implements OnInit {

  private readonly designationService = inject(DesignationService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly data = signal<PaginatedResult<DesignationListItem> | null>(null);
  readonly viewMode = signal<'table' | 'hierarchy'>('table');
  readonly searchCtrl = new FormControl('');
  readonly statusCtrl = new FormControl<boolean | null>(null);
  readonly gradeCtrl = new FormControl<string | null>(null);
  readonly cols = ['designationCode', 'designationName', 'parentDesignationName', 'departmentName', 'salaryGrade', 'employeeCount', 'status', 'actions'];

  readonly gradeOptions = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'];

  page = 1;
  pageSize = 20;

  ngOnInit() {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.load();
    });
    this.statusCtrl.valueChanges.subscribe(() => { this.page = 1; this.load(); });
    this.gradeCtrl.valueChanges.subscribe(() => { this.page = 1; this.load(); });
  }

  load() {
    this.loading.set(true);
    this.designationService.getAll({
      page: this.page,
      pageSize: this.pageSize,
      search: this.searchCtrl.value || undefined,
      isActive: this.statusCtrl.value ?? undefined,
      salaryGrade: this.gradeCtrl.value ?? undefined,
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

  editDesignation(id: string) {
    this.router.navigate(['/designations', id, 'edit']);
  }

  deleteDesignation(item: DesignationListItem) {
    if (!confirm(`Delete designation "${item.designationName}"?`)) return;
    this.designationService.delete(item.id).subscribe({
      next: () => {
        this.notification.success('Designation deleted.');
        this.load();
      },
      error: () => this.notification.error('Failed to delete designation.'),
    });
  }

  clearFilters() {
    this.searchCtrl.setValue('');
    this.statusCtrl.setValue(null);
    this.gradeCtrl.setValue(null);
  }
}
