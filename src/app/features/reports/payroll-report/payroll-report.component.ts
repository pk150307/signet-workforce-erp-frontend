import { Component, inject, signal } from '@angular/core';
import { ReportsService } from '../../../core/services/reports.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PayrollReportData, ReportQuery } from '../../../core/models/reports.models';
import { downloadReportCsv } from '../report-export.util';

@Component({
  selector: 'app-payroll-report',
  templateUrl: './payroll-report.component.html',
  styleUrl: './payroll-report.component.less',
})
export class PayrollReportComponent {
  private readonly reportsService = inject(ReportsService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(true);
  readonly report = signal<PayrollReportData | null>(null);
  private query: ReportQuery = {};

  onFiltersChange(query: ReportQuery): void {
    this.query = query;
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.reportsService.getPayrollReport(this.query).subscribe({
      next: (data) => {
        this.report.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.report.set(null);
        this.loading.set(false);
        this.notification.error('Failed to load payroll report.');
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
      `payroll-report-${report.period.label}`,
      ['Client', 'Net Pay', 'Employees'],
      report.rows.map((row) => [row.label, row.value, row.trend ?? '']),
    );
  }
}
