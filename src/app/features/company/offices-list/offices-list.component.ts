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
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { confirmDialogConfig } from '../../../core/utils/dialog.util';

import { CompanyService } from '../../../core/services/company.service';
import { NotificationService } from '../../../core/services/notification.service';
import { OfficeListItem } from '../../../core/models/company.models';
import { PaginatedResult } from '../../../core/models/api.models';

import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({
  selector: 'app-offices-list',
  standalone: true,
  imports: [
    SkeletonLoaderComponent,
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
  ],
  templateUrl: './offices-list.component.html',
  styleUrl: './offices-list.component.less',
})
export class OfficesListComponent implements OnInit {

  private readonly companyService = inject(CompanyService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly data = signal<PaginatedResult<OfficeListItem> | null>(null);
  readonly searchCtrl = new FormControl('');
  readonly statusCtrl = new FormControl<boolean | null>(null);
  readonly cols = ['officeCode', 'officeName', 'branchName', 'floor', 'capacity', 'status', 'actions'];

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
    this.companyService.getOffices({
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

  deleteOffice(office: OfficeListItem) {
    this.dialog.open(
      ConfirmDialogComponent,
      confirmDialogConfig({
        title: 'Delete Office',
        message: `Delete office "${office.officeName}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
        icon: 'delete',
        confirmColor: 'warn',
      }),
    ).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.companyService.deleteOffice(office.id).subscribe({
        next: () => {
          this.notification.success('Office deleted.');
          this.load();
        },
        error: () => this.notification.error('Failed to delete office.'),
      });
    });
  }

  clearFilters() {
    this.searchCtrl.setValue('');
    this.statusCtrl.setValue(null);
  }
}
