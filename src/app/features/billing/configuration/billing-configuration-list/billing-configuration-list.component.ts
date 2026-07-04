import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { debounceTime } from 'rxjs';
import { BillingConfigurationService } from '../../../../core/services/billing-configuration.service';
import { BillingFilterService } from '../../../../core/services/billing-filter.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { BillingConfigurationListItem } from '../../../../core/models/billing.models';
import { CursorPageParams, CursorPaginatedResult } from '../../../../core/models/api.models';
import {
  CursorPaginationState,
  emptyCursorPage,
  isInvalidCursorError,
  resolvePaginationNavigate,
} from '../../../../core/utils/cursor-pagination.util';
import { PaginationNavigateEvent } from '../../../../library/components/pagination/pagination.component';
import { BillingSubnavComponent } from '../../shared/billing-subnav/billing-subnav.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-billing-configuration-list',
    templateUrl: './billing-configuration-list.component.html',
  styleUrl: './billing-configuration-list.component.less',
})
export class BillingConfigurationListComponent implements OnInit {
  private readonly service = inject(BillingConfigurationService);
  private readonly billingFilter = inject(BillingFilterService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  readonly router = inject(Router);

  readonly loading = signal(true);
  readonly data = signal<CursorPaginatedResult<BillingConfigurationListItem> | null>(null);
  readonly pager = new CursorPaginationState();
  readonly searchCtrl = new FormControl('');
  readonly cols = ['site', 'client', 'billingType', 'gstPct', 'serviceCharge', 'headcount', 'status', 'actions'];


  ngOnInit() {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(350)).subscribe(() => {
      this.pager.reset();
      this.load(this.pager.firstPageParams());
    });
    this.billingFilter.filterChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.pager.reset();
      this.load(this.pager.firstPageParams());
    });
  }

  load(params?: CursorPageParams) {
    this.loading.set(true);
    const pageParams = params ?? this.pager.firstPageParams();
    this.service.list({
      ...pageParams,
      search: this.searchCtrl.value || undefined,
      clientId: this.billingFilter.clientIdOrUndefined(),
    }).subscribe({
      next: r => {
        this.data.set(r);
        this.pager.apply(r.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.data.set(emptyCursorPage(this.pager.pageSize));
        this.pager.reset();
        this.notification.error('Failed to load configurations.');
        this.loading.set(false);
      },
    });
  }

  onPaginationNavigate(event: PaginationNavigateEvent) {
    const p = resolvePaginationNavigate(this.pager, event);
    if (p) this.load(p);
  }
}
