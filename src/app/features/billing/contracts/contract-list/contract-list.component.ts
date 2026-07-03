import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIf, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContractService } from '../../../../core/services/contract.service';
import { BillingFilterService } from '../../../../core/services/billing-filter.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ContractListItem } from '../../../../core/models/billing.models';
import { PaginatedResult } from '../../../../core/models/api.models';
import { BillingSubnavComponent } from '../../shared/billing-subnav.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ApiDatePipe } from '../../../../shared/pipes/api-date.pipe';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [
    NgIf, NgFor, RouterLink, MatTableModule, MatPaginatorModule, MatChipsModule,
    MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule,
    BillingSubnavComponent, SkeletonLoaderComponent, EmptyStateComponent, ApiDatePipe,
  ],
  templateUrl: './contract-list.component.html',
  styleUrl: './contract-list.component.less',
})
export class ContractListComponent implements OnInit {
  private readonly service = inject(ContractService);
  private readonly billingFilter = inject(BillingFilterService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly data = signal<PaginatedResult<ContractListItem> | null>(null);
  readonly cols = ['code', 'name', 'client', 'site', 'period', 'billingRates', 'status', 'actions'];
  page = 1;
  pageSize = 20;

  ngOnInit() {
    this.load();
    this.billingFilter.filterChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.page = 1;
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.service.list({
      page: this.page,
      pageSize: this.pageSize,
      clientId: this.billingFilter.clientIdOrUndefined(),
    }).subscribe({
      next: r => { this.data.set(r); this.loading.set(false); },
      error: () => { this.notification.error('Failed to load contracts.'); this.loading.set(false); },
    });
  }

  onPage(e: PageEvent) {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.load();
  }

  billingRatesLabel(row: ContractListItem): string {
    const pf = row.pfPct ?? 13;
    const esic = row.esicPct ?? 3.25;
    const lwf = row.lwfPct ?? 0.4;
    const sc = row.serviceChargePct ?? 6;
    return `EPF ${pf}% · ESIC ${esic}% · LWF ${lwf}% · SC ${sc}%`;
  }
}
