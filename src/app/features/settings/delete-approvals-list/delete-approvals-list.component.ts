import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { DeleteRequestsService } from '../../../core/services/delete-requests.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { IAM_PERMISSIONS } from '../../../core/constants/iam-permissions.constants';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { confirmDialogConfig, featureDialogConfig } from '../../../core/utils/dialog.util';
import { CursorPageParams, CursorPaginatedResult } from '../../../core/models/api.models';
import { DeleteRequestListItem } from '../../../core/models/iam.models';
import { RejectRemarksDialogComponent } from '../reject-remarks-dialog/reject-remarks-dialog.component';
import {
  CursorPaginationState,
  emptyCursorPage,
  isInvalidCursorError,
  resolvePaginationNavigate,
} from '../../../core/utils/cursor-pagination.util';
import { PaginationNavigateEvent } from '../../../library/components/pagination/pagination.component';

const STATUS_ALL = 'all';

@Component({
  selector: 'app-delete-approvals-list',
  templateUrl: './delete-approvals-list.component.html',
  styleUrl: './delete-approvals-list.component.less',
})
export class DeleteApprovalsListComponent implements OnInit {
  private readonly deleteRequestsService = inject(DeleteRequestsService);
  private readonly notification = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly data = signal<CursorPaginatedResult<DeleteRequestListItem> | null>(null);
  readonly pager = new CursorPaginationState();
  readonly searchCtrl = new FormControl('', { nonNullable: true });
  readonly statusCtrl = new FormControl(STATUS_ALL, { nonNullable: true });

  readonly statusOptions = [
    { key: STATUS_ALL, value: 'All' },
    { key: 'pending', value: 'Pending' },
    { key: 'approved', value: 'Approved' },
    { key: 'rejected', value: 'Rejected' },
  ];

  readonly items = computed(() => this.data()?.items ?? []);
  readonly hasItems = computed(() => this.items().length > 0);
  readonly canApprove = this.authService.hasPermission(IAM_PERMISSIONS.deleteRequests.approve);

  ngOnInit(): void {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.reloadFirstPage();
    });
    this.statusCtrl.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      this.reloadFirstPage();
    });
  }

  load(params?: CursorPageParams): void {
    this.loading.set(true);
    const pageParams = params ?? this.pager.firstPageParams();
    const status = this.statusCtrl.value;

    this.deleteRequestsService.list({
      ...pageParams,
      search: this.searchCtrl.value?.trim() || undefined,
      status: status && status !== STATUS_ALL ? status : undefined,
    }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.pager.apply(result.pagination);
        this.loading.set(false);
      },
      error: (err) => {
        if (isInvalidCursorError(err)) {
          this.pager.reset();
          this.load(this.pager.firstPageParams());
          return;
        }
        this.data.set(emptyCursorPage(this.pager.pageSize));
        this.pager.reset();
        this.loading.set(false);
        this.notification.error(err?.error?.detail ?? err?.error?.message ?? 'Failed to load delete requests.');
      },
    });
  }

  onPaginationNavigate(event: PaginationNavigateEvent) {
    const p = resolvePaginationNavigate(this.pager, event);
    if (p) this.load(p);
  }

  private reloadFirstPage(): void {
    this.pager.reset();
    this.load(this.pager.firstPageParams());
  }

  approve(row: DeleteRequestListItem): void {
    this.dialog.open(ConfirmDialogComponent, confirmDialogConfig({
      title: 'Approve delete request',
      message: `Permanently soft-delete ${row.entityLabel ?? row.entityType}? This cannot be undone.`,
      confirmLabel: 'Approve',
      confirmColor: 'warn',
    })).afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.deleteRequestsService.approve(row.id).subscribe({
        next: () => {
          this.notification.success('Delete request approved.');
          this.load(this.pager.currentPageParams());
        },
        error: (err) => this.notification.error(err?.error?.detail ?? err?.error?.message ?? 'Failed to approve request.'),
      });
    });
  }

  reject(row: DeleteRequestListItem): void {
    this.dialog.open(RejectRemarksDialogComponent, {
      ...featureDialogConfig({ width: '480px' }),
      data: {
        title: 'Reject delete request',
        entityLabel: row.entityLabel,
      },
    }).afterClosed().subscribe((remarks) => {
      if (!remarks) return;
      this.deleteRequestsService.reject(row.id, remarks).subscribe({
        next: () => {
          this.notification.success('Delete request rejected.');
          this.load(this.pager.currentPageParams());
        },
        error: (err) => this.notification.error(err?.error?.detail ?? err?.error?.message ?? 'Failed to reject request.'),
      });
    });
  }

  isPending(row: DeleteRequestListItem): boolean {
    return String(row.status ?? '').toLowerCase() === 'pending';
  }

  statusLabel(status: string | null | undefined): string {
    const value = String(status ?? '').toLowerCase();
    if (!value) return '—';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
