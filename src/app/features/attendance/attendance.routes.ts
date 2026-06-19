import { Routes } from '@angular/router';

export const ATTENDANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./attendance-dashboard/attendance-dashboard.component').then(m => m.AttendanceDashboardComponent),
  },
  {
    path: 'daily',
    loadComponent: () => import('./daily-attendance/daily-attendance.component').then(m => m.DailyAttendanceComponent),
  },
  {
    path: 'monthly',
    loadComponent: () => import('./monthly-attendance/monthly-attendance.component').then(m => m.MonthlyAttendanceComponent),
  },
  {
    path: 'calendar',
    loadComponent: () => import('./attendance-calendar/attendance-calendar.component').then(m => m.AttendanceCalendarComponent),
  },
  {
    path: 'corrections',
    loadComponent: () => import('./attendance-correction/attendance-correction.component').then(m => m.AttendanceCorrectionComponent),
  },
];
