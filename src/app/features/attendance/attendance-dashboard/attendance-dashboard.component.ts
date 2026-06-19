import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AttendanceService } from '../../../core/services/attendance.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { AttendanceSummary } from '../../../core/models/attendance.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-attendance-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, MatButtonModule, MatIconModule, SkeletonLoaderComponent],
  templateUrl: './attendance-dashboard.component.html',
  styleUrl: './attendance-dashboard.component.less',
})
export class AttendanceDashboardComponent implements OnInit {
  private readonly attendanceService = inject(AttendanceService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  readonly loading = signal(true);
  readonly summary = signal<AttendanceSummary | null>(null);
  readonly links = [
    { route: '/attendance/daily', icon: 'today', label: 'Daily Attendance' },
    { route: '/attendance/monthly', icon: 'calendar_month', label: 'Monthly Attendance' },
    { route: '/attendance/calendar', icon: 'calendar_view_month', label: 'Calendar View' },
    { route: '/attendance/corrections', icon: 'edit_note', label: 'Corrections' },
  ];
  ngOnInit() { this.breadcrumbService.setItems([{ label: 'Attendance' }]); this.load(); }
  load() { this.loading.set(true); this.attendanceService.getSummary().subscribe({ next: s => { this.summary.set(s); this.loading.set(false); }, error: () => this.loading.set(false) }); }
}