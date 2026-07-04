import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BillingReportsService } from '../../../../core/services/billing-reports.service';
import { BillingFilterService } from '../../../../core/services/billing-filter.service';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  BillingPeriodSummary,
  CollectionsReport,
  GstReport,
  OutstandingReport,
} from '../../../../core/models/billing.models';
import { CursorPageParams } from '../../../../core/models/api.models';
import {
  CursorPaginationState,
  isInvalidCursorError,
} from '../../../../core/utils/cursor-pagination.util';
import { PaginationNavigateEvent } from '../../../../library/components/pagination/pagination.component';

@Component({
  selector: 'app-billing-reports',
  templateUrl: './billing-reports.component.html',
  styleUrl: './billing-reports.component.less',
})
export class BillingReportsComponent implements OnInit {
  private readonly service = inject(BillingReportsService);
  private readonly billingFilter = inject(BillingFilterService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly summary = signal<BillingPeriodSummary | null>(null);
  readonly outstanding = signal<OutstandingReport | null>(null);
  readonly collections = signal<CollectionsReport | null>(null);
  readonly gst = signal<GstReport | null>(null);
  readonly outstandingPager = new CursorPaginationState();
  readonly collectionsPager = new CursorPaginationState();
  readonly sectionItems = [
    { label: 'Summary', value: 'summary' },
    { label: 'Outstanding', value: 'outstanding' },
    { label: 'Collections', value: 'collections' },
    { label: 'GST', value: 'gst' },
  ];
  readonly activeSection = signal('summary');

  ngOnInit() {
    this.loadAll();
    this.billingFilter.filterChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.outstandingPager.reset();
      this.collectionsPager.reset();
      this.loadAll();
    });
  }

  periodLabel(): string {
    return `${this.billingFilter.month()}/${this.billingFilter.year()}`;
  }

  loadAll() {
    const month = this.billingFilter.month();
    const year = this.billingFilter.year();
    const clientId = this.billingFilter.clientIdOrUndefined();
    this.loading.set(true);
    this.service.getSummary({ month, year, clientId }).subscribe({
      next: s => this.summary.set(s),
      error: () => this.notification.error('Failed to load summary.'),
    });
    this.loadOutstanding(this.outstandingPager.firstPageParams());
    this.loadCollections(this.collectionsPager.firstPageParams());
    this.service.getGst({ month, year, clientId }).subscribe({
      next: r => { this.gst.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  loadOutstanding(params?: CursorPageParams) {
    const clientId = this.billingFilter.clientIdOrUndefined();
    const pageParams = params ?? this.outstandingPager.firstPageParams();
    this.service.getOutstanding({ clientId, ...pageParams }).subscribe({
      next: r => {
        this.outstanding.set(r);
        this.outstandingPager.apply(r.pagination);
      },
      error: (err) => {
        if (isInvalidCursorError(err)) {
          this.outstandingPager.reset();
          this.loadOutstanding(this.outstandingPager.firstPageParams());
          return;
        }
        this.outstanding.set(null);
        this.outstandingPager.reset();
      },
    });
  }

  loadCollections(params?: CursorPageParams) {
    const month = this.billingFilter.month();
    const year = this.billingFilter.year();
    const clientId = this.billingFilter.clientIdOrUndefined();
    const pageParams = params ?? this.collectionsPager.firstPageParams();
    this.service.getCollections({ month, year, clientId, ...pageParams }).subscribe({
      next: r => {
        this.collections.set(r);
        this.collectionsPager.apply(r.pagination);
      },
      error: (err) => {
        if (isInvalidCursorError(err)) {
          this.collectionsPager.reset();
          this.loadCollections(this.collectionsPager.firstPageParams());
          return;
        }
        this.collections.set(null);
        this.collectionsPager.reset();
      },
    });
  }

  onOutstandingNavigate(event: PaginationNavigateEvent) {
    if (event.direction === 'next') {
      const p = this.outstandingPager.nextPageParams();
      if (p) this.loadOutstanding(p);
      return;
    }
    const p = this.outstandingPager.prevPageParams();
    if (p) this.loadOutstanding(p);
  }

  onCollectionsNavigate(event: PaginationNavigateEvent) {
    if (event.direction === 'next') {
      const p = this.collectionsPager.nextPageParams();
      if (p) this.loadCollections(p);
      return;
    }
    const p = this.collectionsPager.prevPageParams();
    if (p) this.loadCollections(p);
  }
}
