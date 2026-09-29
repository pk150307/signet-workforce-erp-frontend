import { Component, inject, signal } from '@angular/core';
import { ReportsService } from '../../../core/services/reports.service';
import { NotificationService } from '../../../core/services/notification.service';
import { InvoiceReportData, ReportQuery } from '../../../core/models/reports.models';
import { downloadReportCsv } from '../report-export.util';

@Component({
  selector: 'app-invoice-report',
  templateUrl: './invoice-report.component.html',
  styleUrl: './invoice-report.component.less',
})
export class InvoiceReportComponent {
  private readonly reportsService = inject(ReportsService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(true);
  readonly report = signal<InvoiceReportData | null>(null);
  private query: ReportQuery = {};

  onFiltersChange(query: ReportQuery): void {
    this.query = query;
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.reportsService.getInvoiceReport(this.query).subscribe({
      next: (data) => {
        this.report.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.report.set(null);
        this.loading.set(false);
        this.notification.error('Failed to load invoice report.');
      },
    });
  }

  formatMoney(value: unknown): string {
    const amount = Number(value ?? 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number.isFinite(amount) ? amount : 0);
  }

  exportReport(): void {
    const report = this.report();
    if (!report) return;
    downloadReportCsv(
      `invoice-report-${report.period.label}`,
      ['Client', 'Billed'],
      report.rows.map((row) => [row.label, row.value]),
    );
  }
}
