import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { DesignationService } from '../../../core/services/designation.service';
import { ClientsService } from '../../../core/services/clients.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { runDeleteWithApproval } from '../../../core/utils/delete-record.util';
import { DesignationListItem } from '../../../core/models/designation.models';
import { ClientListItem } from '../../../core/models/client.models';
import { CursorPageParams, CursorPaginatedResult } from '../../../core/models/api.models';
import {
  CursorPaginationState,
  emptyCursorPage,
  isInvalidCursorError,
  resolvePaginationNavigate,
} from '../../../core/utils/cursor-pagination.util';
import { PaginationNavigateEvent } from '../../../library/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
@Component({
  selector: 'app-designation-list',
    templateUrl: './designation-list.component.html',
  styleUrl: './designation-list.component.less',
})
export class DesignationListComponent implements OnInit {

  private readonly designationService = inject(DesignationService);
  private readonly clientsService = inject(ClientsService);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly data = signal<CursorPaginatedResult<DesignationListItem> | null>(null);
  readonly pager = new CursorPaginationState();
  readonly clients = signal<ClientListItem[]>([]);
  readonly viewMode = signal<'table' | 'hierarchy'>('table');
  readonly searchCtrl = new FormControl('');
  readonly statusCtrl = new FormControl<string>('');
  readonly clientCtrl = new FormControl<string>('');
  readonly cols = ['designationCode', 'designationName', 'departmentName', 'employeeCount', 'status', 'actions'];

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
    this.statusCtrl.valueChanges.subscribe(() => { this.pager.reset(); this.load(this.pager.firstPageParams()); });
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
    this.designationService.getAll({
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
    const p = resolvePaginationNavigate(this.pager, event);
    if (p) this.load(p);
  }

  addDesignationQueryParams(): { clientId?: string } {
    const clientId = this.clientCtrl.value?.trim();
    return clientId ? { clientId } : {};
  }

  viewDesignation(id: string) {
    this.router.navigate(['/designations', id]);
  }

  editDesignation(id: string) {
    this.router.navigate(['/designations', id, 'edit']);
  }

  deleteDesignation(item: DesignationListItem) {
    runDeleteWithApproval({
      auth: this.authService,
      dialog: this.dialog,
      notification: this.notification,
      title: 'Delete Designation',
      entityLabel: item.designationName,
      deleteFn: (reason) => this.designationService.delete(item.id, { reason }),
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
