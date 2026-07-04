import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, } from '@angular/common';
import { FormControl } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { UsersService } from '../../../core/services/users.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { IAM_PERMISSIONS } from '../../../core/constants/iam-permissions.constants';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { confirmDialogConfig } from '../../../core/utils/dialog.util';
import { CursorPageParams, CursorPaginatedResult } from '../../../core/models/api.models';
import {
  CursorPaginationState,
  emptyCursorPage,
  isInvalidCursorError,
} from '../../../core/utils/cursor-pagination.util';
import { PaginationNavigateEvent } from '../../../library/components/pagination/pagination.component';
import { IamUserListItem } from '../../../core/models/iam.models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { UserDrawerComponent } from '../user-drawer/user-drawer.component';

@Component({
  selector: 'app-users-list',
    templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.less',
})
export class UsersListComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly notification = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly drawerOpen = signal(false);
  readonly selectedUserId = signal<string | null>(null);
  readonly data = signal<CursorPaginatedResult<IamUserListItem> | null>(null);
  readonly pager = new CursorPaginationState();
  readonly searchCtrl = new FormControl('');
  readonly cols = ['fullName', 'email', 'roles', 'status', 'lastLoginAt', 'actions'];

  readonly canCreate = this.authService.hasPermission(IAM_PERMISSIONS.users.create);
  readonly canUpdate = this.authService.hasPermission(IAM_PERMISSIONS.users.update);
  readonly canApprove = this.authService.hasPermission(IAM_PERMISSIONS.users.approve);


  ngOnInit(): void {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.pager.reset();
      this.load(this.pager.firstPageParams());
    });
  }

  load(params?: CursorPageParams) {
    this.loading.set(true);
    const pageParams = params ?? this.pager.firstPageParams();
    this.usersService.list({ ...pageParams, search: this.searchCtrl.value || undefined }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.pager.apply(result.pagination);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notification.error(err?.error?.message ?? 'Failed to load users.');
      },
    });
  }

  openCreate(): void {
    this.selectedUserId.set(null);
    this.drawerOpen.set(true);
  }

  openEdit(user: IamUserListItem): void {
    this.selectedUserId.set(user.id);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.selectedUserId.set(null);
  }

  onSaved(): void {
    this.closeDrawer();
    this.load();
  }

  toggleStatus(user: IamUserListItem): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    this.dialog.open(ConfirmDialogComponent, confirmDialogConfig({
      title: `${user.isActive ? 'Deactivate' : 'Activate'} user`,
      message: `Are you sure you want to ${action} ${user.fullName ?? user.email}?`,
      confirmLabel: user.isActive ? 'Deactivate' : 'Activate',
      confirmColor: user.isActive ? 'warn' : 'primary',
    })).afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.usersService.updateStatus(user.id, { isActive: !user.isActive, unlockAccount: !user.isActive }).subscribe({
        next: () => {
          this.notification.success(`User ${action}d successfully.`);
          this.load();
        },
        error: (err) => this.notification.error(err?.error?.message ?? `Failed to ${action} user.`),
      });
    });
  }

  resetPassword(user: IamUserListItem): void {
    this.dialog.open(ConfirmDialogComponent, confirmDialogConfig({
      title: 'Reset password',
      message: `Send a password reset email to ${user.email}?`,
      confirmLabel: 'Send reset email',
    })).afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.usersService.resetPassword(user.id, { mode: 'email', forcePasswordReset: true }).subscribe({
        next: (res) => this.notification.success(res.message ?? 'Password reset initiated.'),
        error: (err) => this.notification.error(err?.error?.message ?? 'Failed to reset password.'),
      });
    });
  }

  onPaginationNavigate(event: PaginationNavigateEvent) {
    if (event.direction === 'next') {
      const p = this.pager.nextPageParams();
      if (p) this.load(p);
    } else {
      const p = this.pager.prevPageParams();
      if (p) this.load(p);
    }
  }
}
