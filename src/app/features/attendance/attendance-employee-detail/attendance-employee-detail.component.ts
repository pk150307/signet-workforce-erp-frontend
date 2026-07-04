import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgClass, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl } from '@angular/forms';
import { AttendanceService } from '../../../core/services/attendance.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import {
  EmployeeAttendanceCalendar,
  MONTH_NAMES,
  cellClass,
  cellShort,
} from '../../../core/models/attendance.models';

@Component({
  selector: 'app-attendance-employee-detail',
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

  readonly monthOptions = computed(() =>
    this.monthNames.map((name, i) => ({ key: String(i + 1), value: name })),
  );

  readonly yearOptions = computed(() =>
    this.years.map(y => ({ key: String(y), value: String(y) })),
  );

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
