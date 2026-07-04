import { Component, OnInit, inject, signal } from '@angular/core';
import { ReportsService } from '../../../core/services/reports.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PayrollReportData } from '../../../core/models/reports.models';

@Component({
  selector: 'app-payroll-report',
  templateUrl: './payroll-report.component.html',
  styleUrl: './payroll-report.component.less',
})
export class PayrollReportComponent implements OnInit {
  private readonly reportsService = inject(ReportsService);
  private readonly notification = inject(NotificationService);
  readonly loading = signal(true);
  readonly report = signal<PayrollReportData | null>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.reportsService.getPayrollReport().subscribe({
      next: (data) => { this.report.set(data); this.loading.set(false); },
      error: () => {
        this.report.set(null);
        this.loading.set(false);
        this.notification.error('Failed to load payroll report.');
      },
    });
  }

  formatSummaryLabel(key: string): string {
    const labels: Record<string, string> = {
      grossPay: 'Gross Pay',
      deductions: 'Deductions',
      netPay: 'Net Pay',
      employeeCount: 'Employees',
    };
    return labels[key] ?? key;
  }

  formatSummaryValue(key: string, value: unknown): string {
    if (key === 'employeeCount') return String(value ?? 0);
    const amount = Number(value ?? 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number.isFinite(amount) ? amount : 0);
  }
}