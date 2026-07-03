import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { BillingReportsService } from '../../../../core/services/billing-reports.service';
import { BillingFilterService } from '../../../../core/services/billing-filter.service';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  BillingPeriodSummary,
  CollectionsReport,
  GstReport,
  OutstandingReport,
} from '../../../../core/models/billing.models';
import { BillingSubnavComponent } from '../../shared/billing-subnav.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ApiDatePipe } from '../../../../shared/pipes/api-date.pipe';

@Component({
  selector: 'app-billing-reports',
  standalone: true,
  imports: [
    NgIf, NgFor, DecimalPipe,
    MatTabsModule, MatButtonModule, MatIconModule, MatTableModule,
    BillingSubnavComponent, SkeletonLoaderComponent, ApiDatePipe,
  ],
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

  ngOnInit() {
    this.loadAll();
    this.billingFilter.filterChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadAll());
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
    this.service.getOutstanding({ clientId }).subscribe({
      next: r => this.outstanding.set(r),
    });
    this.service.getCollections({ month, year, clientId }).subscribe({
      next: r => this.collections.set(r),
    });
    this.service.getGst({ month, year, clientId }).subscribe({
      next: r => { this.gst.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
