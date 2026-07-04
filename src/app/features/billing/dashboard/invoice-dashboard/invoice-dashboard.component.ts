import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { BillingFilterService } from '../../../../core/services/billing-filter.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { BillingSubnavComponent } from '../../shared/billing-subnav/billing-subnav.component';
import { getMockBillingDashboard, getMockSiteBillingSummary } from '../../invoices/invoice.mock';
import { SiteBillingSummary } from '../../../../core/models/invoice.models';
@Component({
  selector: 'app-invoice-dashboard',
    templateUrl: './invoice-dashboard.component.html',
  styleUrl: './invoice-dashboard.component.less',
})
export class InvoiceDashboardComponent implements OnInit {

  private readonly invoiceService = inject(InvoiceService);
  private readonly billingFilter = inject(BillingFilterService);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  readonly router = inject(Router);

  readonly loading = signal(true);
  readonly usingMock = signal(false);
  readonly kpis = signal(getMockBillingDashboard());
  readonly siteSummary = signal<SiteBillingSummary[]>([]);

  ngOnInit() {
    this.loadData();
    this.billingFilter.filterChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadData());
  }

  periodLabel(): string {
    return `${this.billingFilter.month()}/${this.billingFilter.year()}`;
  }

  loadData() {
    this.loading.set(true);
    const clientId = this.billingFilter.clientIdOrUndefined();

    this.invoiceService.getDashboardData(
      this.billingFilter.month(),
      this.billingFilter.year(),
      clientId,
    ).subscribe({
      next: ({ kpis, siteSummary }) => {
        this.kpis.set(kpis);
        this.siteSummary.set(siteSummary);
        this.usingMock.set(false);
        this.loading.set(false);
      },
      error: () => {
        const mockSummary = getMockSiteBillingSummary();
        this.siteSummary.set(mockSummary);
        this.kpis.set(getMockBillingDashboard());
        this.usingMock.set(true);
        this.loading.set(false);
        this.notification.info('Showing sample billing data.');
      },
    });
  }

  formatCurrency(value: number): string {
    if (value >= 100000) return '₹' + (value / 100000).toFixed(1) + 'L';
    if (value >= 1000) return '₹' + (value / 1000).toFixed(0) + 'K';
    return '₹' + value.toLocaleString('en-IN');
  }
}
