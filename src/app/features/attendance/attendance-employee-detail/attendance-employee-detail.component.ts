import { Component, OnInit, inject, signal } from '@angular/core';
import { NgClass, NgFor, NgIf, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AttendanceService } from '../../../core/services/attendance.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import {
  EmployeeAttendanceCalendar,
  MONTH_NAMES,
  cellClass,
  cellShort,
} from '../../../core/models/attendance.models';

import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({
  selector: 'app-attendance-employee-detail',
  standalone: true,
  imports: [
    SkeletonLoaderComponent,
    NgIf, NgFor, NgClass, DecimalPipe, RouterLink, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, MatProgressSpinnerModule,
  ],
  templateUrl: './attendance-employee-detail.component.html',
  styleUrl: './attendance-employee-detail.component.less',
})
export class AttendanceEmployeeDetailComponent implements OnInit {
  private readonly attendanceService = inject(AttendanceService);
  private readonly route = inject(ActivatedRoute);
  private readonly breadcrumbService = inject(BreadcrumbService);

  readonly loading = signal(true);
  readonly calendar = signal<EmployeeAttendanceCalendar | null>(null);
  readonly monthNames = MONTH_NAMES;
  readonly cellClass = cellClass;
  readonly cellShort = cellShort;
  readonly years = [2024, 2025, 2026, 2027];

  readonly monthCtrl = new FormControl(new Date().getMonth() + 1);
  readonly yearCtrl = new FormControl(new Date().getFullYear());
  employeeId = '';

  ngOnInit() {
    this.employeeId = this.route.snapshot.paramMap.get('id') ?? '';
    const q = this.route.snapshot.queryParamMap;
    if (q.get('month')) this.monthCtrl.setValue(Number(q.get('month')));
    if (q.get('year')) this.yearCtrl.setValue(Number(q.get('year')));

    this.monthCtrl.valueChanges.subscribe(() => this.load());
    this.yearCtrl.valueChanges.subscribe(() => this.load());
    this.load();
  }

  load() {
    this.loading.set(true);
    this.attendanceService.getEmployeeCalendar(
      this.employeeId,
      this.monthCtrl.value ?? 1,
      this.yearCtrl.value ?? new Date().getFullYear(),
    ).subscribe({
      next: c => {
        this.calendar.set(c);
        this.breadcrumbService.updateLast(c.employeeName);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  weekDayLabel(dow: number): string {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow] ?? '';
  }
}
