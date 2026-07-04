import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIf, NgFor } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContractService } from '../../../../core/services/contract.service';
import { BillingFilterService } from '../../../../core/services/billing-filter.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ContractListItem } from '../../../../core/models/billing.models';
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
import { ApiDatePipe } from '../../../../shared/pipes/api-date.pipe';
@Component({
  selector: 'app-contract-list',
    templateUrl: './contract-list.component.html',
  styleUrl: './contract-list.component.less',
})
export class ContractListComponent implements OnInit {
  private readonly service = inject(ContractService);
  private readonly billingFilter = inject(BillingFilterService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  readonly router = inject(Router);

  readonly loading = signal(true);
  readonly data = signal<CursorPaginatedResult<ContractListItem> | null>(null);
  readonly pager = new CursorPaginationState();
  readonly cols = ['code', 'name', 'client', 'site', 'period', 'billingRates', 'status', 'actions'];


  ngOnInit() {
    this.load();
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
        this.notification.error('Failed to load contracts.');
        this.loading.set(false);
      },
    });
  }

  onPaginationNavigate(event: PaginationNavigateEvent) {
    const p = resolvePaginationNavigate(this.pager, event);
    if (p) this.load(p);
  }

  billingRatesLabel(row: ContractListItem): string {
    const pf = row.pfPct ?? 13;
    const esic = row.esicPct ?? 3.25;
    const lwf = row.lwfPct ?? 0.4;
    const sc = row.serviceChargePct ?? 6;
    return `EPF ${pf}% · ESIC ${esic}% · LWF ${lwf}% · SC ${sc}%`;
  }
}
