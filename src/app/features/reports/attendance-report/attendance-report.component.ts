import { Component, OnInit, inject, signal } from '@angular/core';
import { ReportsService } from '../../../core/services/reports.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AttendanceReportData } from '../../../core/models/reports.models';

@Component({
  selector: 'app-attendance-report',
  templateUrl: './attendance-report.component.html',
  styleUrl: './attendance-report.component.less',
})
export class AttendanceReportComponent implements OnInit {
  private readonly reportsService = inject(ReportsService);
  private readonly notification = inject(NotificationService);
  readonly loading = signal(true);
  readonly report = signal<AttendanceReportData | null>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.reportsService.getAttendanceReport().subscribe({
      next: (data) => { this.report.set(data); this.loading.set(false); },
      error: () => {
        this.report.set(null);
        this.loading.set(false);
        this.notification.error('Failed to load attendance report.');
      },
    });
  }

  formatSummaryLabel(key: string): string {
    const labels: Record<string, string> = {
      present: 'Present',
      absent: 'Absent',
      onLeave: 'On Leave',
      late: 'Late',
    };
    return labels[key] ?? key;
  }
}