import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./reports-hub/reports-hub.component').then(m => m.ReportsHubComponent),
  },
  {
    path: 'attendance',
    data: { breadcrumb: 'Attendance Report' },
    loadComponent: () => import('./attendance-report/attendance-report.component').then(m => m.AttendanceReportComponent),
  },
  {
    path: 'payroll',
    data: { breadcrumb: 'Payroll Report' },
    loadComponent: () => import('./payroll-report/payroll-report.component').then(m => m.PayrollReportComponent),
  },
  {
    path: 'invoices',
    data: { breadcrumb: 'Invoice Report' },
    loadComponent: () => import('./invoice-report/invoice-report.component').then(m => m.InvoiceReportComponent),
  },
  {
    path: 'employees',
    data: { breadcrumb: 'Employee Report' },
    loadComponent: () => import('./employee-report/employee-report.component').then(m => m.EmployeeReportComponent),
  },
];
