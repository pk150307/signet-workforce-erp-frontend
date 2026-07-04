import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { SitesService } from '../../../core/services/sites.service';
import { ClientsService } from '../../../core/services/clients.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { runDeleteWithApproval } from '../../../core/utils/delete-record.util';
import { CursorPageParams, CursorPaginatedResult } from '../../../core/models/api.models';
import {
  CursorPaginationState,
  emptyCursorPage,
  isInvalidCursorError,
  resolvePaginationNavigate,
} from '../../../core/utils/cursor-pagination.util';
import { PaginationNavigateEvent } from '../../../library/components/pagination/pagination.component';
import { SiteListItem } from '../../../core/models/sites.models';
import { ClientListItem } from '../../../core/models/client.models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-site-list',
    templateUrl: './site-list.component.html',
  styleUrl: './site-list.component.less',
})
export class SiteListComponent implements OnInit {
  private readonly sitesService = inject(SitesService);
  private readonly clientsService = inject(ClientsService);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly data = signal<CursorPaginatedResult<SiteListItem> | null>(null);
  readonly pager = new CursorPaginationState();
  readonly clients = signal<ClientListItem[]>([]);
  readonly searchCtrl = new FormControl('');
  readonly clientCtrl = new FormControl<string>('');
  readonly statusCtrl = new FormControl<string>('');
  readonly cols = ['siteCode', 'siteName', 'clientCompanyName', 'city', 'requiredHeadcount', 'deployedHeadcount', 'isActive', 'actions'];

  readonly clientOptions = computed(() => [
    { key: '', value: 'All clients' },
    ...this.clients().map(c => ({ key: String(c.id), value: c.companyName })),
  ]);

  readonly statusOptions = computed(() => [
    { key: '', value: 'All' },
    { key: 'true', value: 'Active' },
    { key: 'false', value: 'Inactive' },
  ]);


  ngOnInit() {
    this.clientsService.getAllForSelect().subscribe({
      next: list => this.clients.set(list),
      error: () => this.clients.set([]),
    });
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.pager.reset();
      this.load(this.pager.firstPageParams());
    });
    this.clientCtrl.valueChanges.subscribe(() => {
      this.pager.reset();
      this.load(this.pager.firstPageParams());
    });
    this.statusCtrl.valueChanges.subscribe(() => {
      this.pager.reset();
      this.load(this.pager.firstPageParams());
    });
  }

  load(params?: CursorPageParams) {
    this.loading.set(true);
    const pageParams = params ?? this.pager.firstPageParams();
    this.sitesService.getAll({
      ...pageParams,
      search: this.searchCtrl.value || undefined,
      clientId: this.clientCtrl.value || undefined,
      isActive: this.parseBoolFilter(this.statusCtrl.value),
    }).subscribe({
      next: r => {
        this.data.set(r);
        this.pager.apply(r.pagination);
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
        this.notification.error('Failed to load sites.');
        this.loading.set(false);
      },
    });
  }

  clearFilters() {
    this.searchCtrl.setValue('');
    this.clientCtrl.setValue('');
    this.statusCtrl.setValue('');
  }

  private parseBoolFilter(value: string | null): boolean | undefined {
    if (!value) return undefined;
    return value === 'true';
  }

  onPaginationNavigate(event: PaginationNavigateEvent) {
    const p = resolvePaginationNavigate(this.pager, event);
    if (p) this.load(p);
  }

  viewSite(id: string) {
    this.router.navigate(['/sites', id]);
  }

  deleteSite(site: SiteListItem) {
    runDeleteWithApproval({
      auth: this.authService,
      dialog: this.dialog,
      notification: this.notification,
      title: 'Delete Site',
      entityLabel: site.siteName,
      deleteFn: (reason) => this.sitesService.delete(site.id, site.clientId, { reason }),
      onSuccess: () => this.load(),
    });
  }
}
