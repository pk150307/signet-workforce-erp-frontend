import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { getMockBillingDashboard, getMockSiteBillingSummary } from '../../invoices/invoice.mock';
import { SiteBillingSummary } from '../../../../core/models/invoice.models';

@Component({
  selector: 'app-invoice-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, DecimalPipe, RouterLink, MatButtonModule, MatIconModule, SkeletonLoaderComponent],
  templateUrl: './invoice-dashboard.component.html',
  styleUrl: './invoice-dashboard.component.less',
})
export class InvoiceDashboardComponent implements OnInit {

  private readonly invoiceService = inject(InvoiceService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(true);
  readonly usingMock = signal(false);
  readonly kpis = signal(getMockBillingDashboard());
  readonly siteSummary = signal<SiteBillingSummary[]>([]);

  readonly month = new Date().getMonth() + 1;
  readonly year = new Date().getFullYear();

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    this.invoiceService.getDashboardData(this.month, this.year).subscribe({
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
