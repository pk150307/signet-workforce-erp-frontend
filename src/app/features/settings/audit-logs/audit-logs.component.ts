import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, } from '@angular/common';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { AuditLogsService } from '../../../core/services/audit-logs.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { IAM_PERMISSIONS } from '../../../core/constants/iam-permissions.constants';
import { CursorPageParams, CursorPaginatedResult } from '../../../core/models/api.models';
import {
  CursorPaginationState,
  emptyCursorPage,
  isInvalidCursorError,
  resolvePaginationNavigate,
} from '../../../core/utils/cursor-pagination.util';
import { PaginationNavigateEvent } from '../../../library/components/pagination/pagination.component';
import { AuditLogListItem } from '../../../core/models/iam.models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-audit-logs',
    templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.less',
})
export class AuditLogsComponent implements OnInit {
  private readonly auditLogsService = inject(AuditLogsService);
  private readonly notification = inject(NotificationService);
  private readonly authService = inject(AuthService);

  readonly loading = signal(true);
  readonly data = signal<CursorPaginatedResult<AuditLogListItem> | null>(null);
  readonly pager = new CursorPaginationState();
  readonly searchCtrl = new FormControl('');
  readonly moduleCtrl = new FormControl('');
  readonly cols = ['createdAt', 'userName', 'module', 'action', 'entityType', 'ipAddress'];

  readonly canExport = this.authService.hasPermission(IAM_PERMISSIONS.audit.export);


  ngOnInit(): void {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.pager.reset();
      this.load(this.pager.firstPageParams());
    });
    this.moduleCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.pager.reset();
      this.load(this.pager.firstPageParams());
    });
  }

  load(params?: CursorPageParams) {
    this.loading.set(true);
    const pageParams = params ?? this.pager.firstPageParams();
    this.auditLogsService.list({
      ...pageParams,
      search: this.searchCtrl.value || undefined,
      module: this.moduleCtrl.value || undefined,
    }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.pager.apply(result.pagination);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notification.error(err?.error?.message ?? 'Failed to load audit logs.');
      },
    });
  }

  exportExcel(): void {
    this.downloadExport('excel');
  }

  exportPdf(): void {
    this.downloadExport('pdf');
  }

  private downloadExport(format: 'excel' | 'pdf'): void {
    this.auditLogsService.exportExcel({
      search: this.searchCtrl.value || undefined,
      module: this.moduleCtrl.value || undefined,
      format,
    }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = format === 'pdf' ? 'audit-logs-export.pdf' : 'audit-logs-export.xlsx';
        a.click();
        URL.revokeObjectURL(url);
        this.notification.success(`${format === 'pdf' ? 'PDF' : 'Excel'} export downloaded.`);
      },
      error: () => this.notification.error('Export failed.'),
    });
  }

  onPaginationNavigate(event: PaginationNavigateEvent) {
    const p = resolvePaginationNavigate(this.pager, event);
    if (p) this.load(p);
  }
}
