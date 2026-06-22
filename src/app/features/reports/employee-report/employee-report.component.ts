import { Component, OnInit, inject, signal } from '@angular/core';
import { KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReportsService } from '../../../core/services/reports.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EmployeeReportData } from '../../../core/models/reports.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-employee-report',
  standalone: true,
  imports: [NgIf, NgFor, KeyValuePipe, MatButtonModule, MatIconModule, SkeletonLoaderComponent, EmptyStateComponent],
  templateUrl: './employee-report.component.html',
  styleUrl: './employee-report.component.less',
})
export class EmployeeReportComponent implements OnInit {
  private readonly reportsService = inject(ReportsService);
  private readonly notification = inject(NotificationService);
  readonly loading = signal(true);
  readonly report = signal<EmployeeReportData | null>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.reportsService.getEmployeeReport().subscribe({
      next: (data) => { this.report.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.notification.info('Showing sample report data.'); },
    });
  }
}