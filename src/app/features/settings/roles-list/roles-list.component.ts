import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, } from '@angular/common';
import { FormControl } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { RolesService } from '../../../core/services/roles.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { IAM_PERMISSIONS } from '../../../core/constants/iam-permissions.constants';
import { CursorPageParams, CursorPaginatedResult } from '../../../core/models/api.models';
import {
  CursorPaginationState,
  emptyCursorPage,
  isInvalidCursorError,
} from '../../../core/utils/cursor-pagination.util';
import { PaginationNavigateEvent } from '../../../library/components/pagination/pagination.component';
import { IamRoleListItem } from '../../../core/models/iam.models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { RolePermissionsDrawerComponent } from '../role-permissions-drawer/role-permissions-drawer.component';

@Component({
  selector: 'app-roles-list',
    templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.less',
})
export class RolesListComponent implements OnInit {
  private readonly rolesService = inject(RolesService);
  private readonly notification = inject(NotificationService);
  private readonly authService = inject(AuthService);

  readonly loading = signal(true);
  readonly drawerOpen = signal(false);
  readonly selectedRoleId = signal<string | null>(null);
  readonly data = signal<CursorPaginatedResult<IamRoleListItem> | null>(null);
  readonly pager = new CursorPaginationState();
  readonly searchCtrl = new FormControl('');
  readonly cols = ['name', 'description', 'userCount', 'permissionCount', 'isSystem', 'isActive', 'actions'];

  readonly canUpdate = this.authService.hasPermission(IAM_PERMISSIONS.roles.update);


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
    this.rolesService.list({ ...pageParams, search: this.searchCtrl.value || undefined }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.pager.apply(result.pagination);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notification.error(err?.error?.message ?? 'Failed to load roles.');
      },
    });
  }

  openPermissions(role: IamRoleListItem): void {
    this.selectedRoleId.set(role.id);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.selectedRoleId.set(null);
  }

  onSaved(): void {
    this.closeDrawer();
    this.load();
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
