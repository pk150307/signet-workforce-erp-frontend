import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { DepartmentService } from '../../../core/services/department.service';
import { ClientsService } from '../../../core/services/clients.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { runDeleteWithApproval } from '../../../core/utils/delete-record.util';
import { DepartmentListItem } from '../../../core/models/department.models';
import { ClientListItem } from '../../../core/models/client.models';
import { CursorPageParams, CursorPaginatedResult } from '../../../core/models/api.models';
import {
  CursorPaginationState,
  emptyCursorPage,
  isInvalidCursorError,
} from '../../../core/utils/cursor-pagination.util';
import { PaginationNavigateEvent } from '../../../library/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
@Component({
  selector: 'app-department-list',
    templateUrl: './department-list.component.html',
  styleUrl: './department-list.component.less',
})
export class DepartmentListComponent implements OnInit {

  private readonly departmentService = inject(DepartmentService);
  private readonly clientsService = inject(ClientsService);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly data = signal<CursorPaginatedResult<DepartmentListItem> | null>(null);
  readonly pager = new CursorPaginationState();
  readonly clients = signal<ClientListItem[]>([]);
  readonly viewMode = signal<'table' | 'hierarchy'>('table');
  readonly searchCtrl = new FormControl('');
  readonly statusCtrl = new FormControl<string>('');
  readonly clientCtrl = new FormControl<string>('');
  readonly cols = ['departmentCode', 'departmentName', 'clientName', 'headOfDepartment', 'employeeCount', 'status', 'actions'];

  readonly clientOptions = computed(() => [
    { key: '', value: 'Select client' },
    ...this.clients().map(c => ({ key: String(c.id), value: c.companyName })),
  ]);

  readonly statusOptions = computed(() => [
    { key: '', value: 'All Statuses' },
    { key: 'true', value: 'Active' },
    { key: 'false', value: 'Inactive' },
  ]);


  ngOnInit() {
    const queryClientId = this.route.snapshot.queryParamMap.get('clientId');
    if (queryClientId) {
      this.clientCtrl.setValue(queryClientId, { emitEvent: false });
    }

    this.clientsService.getAllForSelect().subscribe({
      next: clients => {
        this.clients.set(clients.filter(c => c.id && c.companyName));
        if (!this.clientCtrl.value && clients.length === 1) {
          this.clientCtrl.setValue(clients[0].id, { emitEvent: false });
        }
        this.load();
      },
      error: () => this.load(),
    });

    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.pager.reset();
      this.load(this.pager.firstPageParams());
    });
    this.statusCtrl.valueChanges.subscribe(() => {
      this.pager.reset();
      this.load(this.pager.firstPageParams());
    });
    this.clientCtrl.valueChanges.subscribe(() => {
      this.pager.reset();
      this.load(this.pager.firstPageParams());
    });
  }

  load(params?: CursorPageParams) {
    const clientId = this.clientCtrl.value?.trim();
    if (!clientId) {
      this.data.set(null);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    const pageParams = params ?? this.pager.firstPageParams();
    this.departmentService.getAll({
      ...pageParams,
      clientId,
      search: this.searchCtrl.value || undefined,
      isActive: this.parseBoolFilter(this.statusCtrl.value),
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
      },
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

  addDepartmentLink(): string[] {
    const clientId = this.clientCtrl.value?.trim();
    return clientId ? ['/departments/new'] : ['/departments/new'];
  }

  addDepartmentQueryParams(): { clientId?: string } {
    const clientId = this.clientCtrl.value?.trim();
    return clientId ? { clientId } : {};
  }

  viewDepartment(id: string) {
    this.router.navigate(['/departments', id]);
  }

  editDepartment(id: string) {
    this.router.navigate(['/departments', id, 'edit']);
  }

  deleteDepartment(dept: DepartmentListItem) {
    runDeleteWithApproval({
      auth: this.authService,
      dialog: this.dialog,
      notification: this.notification,
      title: 'Delete Department',
      entityLabel: dept.departmentName,
      deleteFn: (reason) => this.departmentService.delete(dept.id, { reason }),
      onSuccess: () => this.load(),
    });
  }

  hasActiveFilters(): boolean {
    return !!(this.searchCtrl.value?.trim() || this.statusCtrl.value);
  }

  clearFilters() {
    this.searchCtrl.setValue('');
    this.statusCtrl.setValue('');
  }

  private parseBoolFilter(value: string | null): boolean | undefined {
    if (!value) return undefined;
    return value === 'true';
  }
}
