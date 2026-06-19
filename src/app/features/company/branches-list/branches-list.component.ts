import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { CompanyService } from '../../../core/services/company.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BranchListItem } from '../../../core/models/company.models';
import { PaginatedResult } from '../../../core/models/api.models';

@Component({
  selector: 'app-branches-list',
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
  ],
  templateUrl: './branches-list.component.html',
  styleUrl: './branches-list.component.less',
})
export class BranchesListComponent implements OnInit {

  private readonly companyService = inject(CompanyService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(true);
  readonly data = signal<PaginatedResult<BranchListItem> | null>(null);
  readonly searchCtrl = new FormControl('');
  readonly statusCtrl = new FormControl<boolean | null>(null);
  readonly cols = ['branchCode', 'branchName', 'location', 'headCount', 'status', 'actions'];

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
    this.companyService.getBranches({
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

  deleteBranch(branch: BranchListItem) {
    if (!confirm(`Delete branch "${branch.branchName}"?`)) return;
    this.companyService.deleteBranch(branch.id).subscribe({
      next: () => {
        this.notification.success('Branch deleted.');
        this.load();
      },
      error: () => this.notification.error('Failed to delete branch.'),
    });
  }

  clearFilters() {
    this.searchCtrl.setValue('');
    this.statusCtrl.setValue(null);
  }
}
