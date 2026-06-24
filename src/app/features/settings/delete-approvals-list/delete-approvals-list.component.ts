import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { DeleteRequestsService } from '../../../core/services/delete-requests.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { IAM_PERMISSIONS } from '../../../core/constants/iam-permissions.constants';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { confirmDialogConfig, featureDialogConfig } from '../../../core/utils/dialog.util';
import { PaginatedResult } from '../../../core/models/api.models';
import { DeleteRequestListItem } from '../../../core/models/iam.models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { RejectRemarksDialogComponent } from '../reject-remarks-dialog/reject-remarks-dialog.component';

@Component({
  selector: 'app-delete-approvals-list',
  standalone: true,
  imports: [
    NgIf,
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    EmptyStateComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './delete-approvals-list.component.html',
  styleUrl: './delete-approvals-list.component.less',
})
export class DeleteApprovalsListComponent implements OnInit {
  private readonly deleteRequestsService = inject(DeleteRequestsService);
  private readonly notification = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly data = signal<PaginatedResult<DeleteRequestListItem> | null>(null);
  readonly searchCtrl = new FormControl('');
  readonly statusCtrl = new FormControl('pending');
  readonly cols = ['entityLabel', 'module', 'reason', 'requestedByName', 'status', 'createdAt', 'actions'];

  readonly canApprove = this.authService.hasPermission(IAM_PERMISSIONS.deleteRequests.approve);

  page = 1;
  pageSize = 20;

  ngOnInit(): void {
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

  load(): void {
    this.loading.set(true);
    this.deleteRequestsService.list({
      page: this.page,
      pageSize: this.pageSize,
      search: this.searchCtrl.value || undefined,
      status: this.statusCtrl.value || undefined,
    }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notification.error(err?.error?.message ?? 'Failed to load delete requests.');
      },
    });
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
          this.load();
        },
        error: (err) => this.notification.error(err?.error?.message ?? 'Failed to approve request.'),
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
          this.load();
        },
        error: (err) => this.notification.error(err?.error?.message ?? 'Failed to reject request.'),
      });
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.load();
  }
}
