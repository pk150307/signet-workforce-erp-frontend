import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { AuditLogsService } from '../../../core/services/audit-logs.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { IAM_PERMISSIONS } from '../../../core/constants/iam-permissions.constants';
import { PaginatedResult } from '../../../core/models/api.models';
import { AuditLogListItem } from '../../../core/models/iam.models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [
    NgIf,
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    EmptyStateComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.less',
})
export class AuditLogsComponent implements OnInit {
  private readonly auditLogsService = inject(AuditLogsService);
  private readonly notification = inject(NotificationService);
  private readonly authService = inject(AuthService);

  readonly loading = signal(true);
  readonly data = signal<PaginatedResult<AuditLogListItem> | null>(null);
  readonly searchCtrl = new FormControl('');
  readonly moduleCtrl = new FormControl('');
  readonly cols = ['createdAt', 'userName', 'module', 'action', 'entityType', 'ipAddress'];

  readonly canExport = this.authService.hasPermission(IAM_PERMISSIONS.audit.export);

  page = 1;
  pageSize = 20;

  ngOnInit(): void {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.load();
    });
    this.moduleCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.load();
    });
  }

  load(): void {
    this.loading.set(true);
    this.auditLogsService.list({
      page: this.page,
      pageSize: this.pageSize,
      search: this.searchCtrl.value || undefined,
      module: this.moduleCtrl.value || undefined,
    }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notification.error(err?.error?.message ?? 'Failed to load audit logs.');
      },
    });
  }

  exportCsv(): void {
    this.auditLogsService.exportCsv({
      search: this.searchCtrl.value || undefined,
      module: this.moduleCtrl.value || undefined,
    }).subscribe({
      next: (csv) => {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audit-logs-export.csv';
        a.click();
        URL.revokeObjectURL(url);
        this.notification.success('Audit log export downloaded.');
      },
      error: () => this.notification.error('Export failed.'),
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.load();
  }
}
