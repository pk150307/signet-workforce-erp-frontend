import { Component, inject, signal } from '@angular/core';
import { ReportsService } from '../../../core/services/reports.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AttendanceReportData, ReportQuery } from '../../../core/models/reports.models';
import { downloadReportCsv } from '../report-export.util';

@Component({
  selector: 'app-attendance-report',
  templateUrl: './attendance-report.component.html',
  styleUrl: './attendance-report.component.less',
})
export class AttendanceReportComponent {
  private readonly reportsService = inject(ReportsService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(true);
  readonly report = signal<AttendanceReportData | null>(null);
  private query: ReportQuery = {};

  onFiltersChange(query: ReportQuery): void {
    this.query = query;
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.reportsService.getAttendanceReport(this.query).subscribe({
      next: (data) => {
        this.report.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.report.set(null);
        this.loading.set(false);
        this.notification.error('Failed to load attendance report.');
      },
    });
  }

  exportReport(): void {
    const report = this.report();
    if (!report) return;
    downloadReportCsv(
      `attendance-report-${report.period.label}`,
      ['Client', 'Attendance'],
      report.rows.map((row) => [row.label, row.value]),
    );
  }
}
