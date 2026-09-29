import { Component, inject, signal } from '@angular/core';
import { ReportsService } from '../../../core/services/reports.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EmployeeReportData, ReportQuery } from '../../../core/models/reports.models';
import { downloadReportCsv } from '../report-export.util';

@Component({
  selector: 'app-employee-report',
  templateUrl: './employee-report.component.html',
  styleUrl: './employee-report.component.less',
})
export class EmployeeReportComponent {
  private readonly reportsService = inject(ReportsService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(true);
  readonly report = signal<EmployeeReportData | null>(null);
  private query: ReportQuery = {};

  onFiltersChange(query: ReportQuery): void {
    this.query = query;
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.reportsService.getEmployeeReport(this.query).subscribe({
      next: (data) => {
        this.report.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.report.set(null);
        this.loading.set(false);
        this.notification.error('Failed to load employee report.');
      },
    });
  }

  exportReport(): void {
    const report = this.report();
    if (!report) return;
    downloadReportCsv(
      `employee-report-${report.period.label}`,
      ['Department', 'Headcount'],
      report.rows.map((row) => [row.label, row.value]),
    );
  }
}
