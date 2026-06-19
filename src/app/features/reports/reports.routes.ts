import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./reports-hub/reports-hub.component').then(m => m.ReportsHubComponent),
  },
  {
    path: 'attendance',
    loadComponent: () => import('./attendance-report/attendance-report.component').then(m => m.AttendanceReportComponent),
  },
  {
    path: 'payroll',
    loadComponent: () => import('./payroll-report/payroll-report.component').then(m => m.PayrollReportComponent),
  },
  {
    path: 'invoices',
    loadComponent: () => import('./invoice-report/invoice-report.component').then(m => m.InvoiceReportComponent),
  },
  {
    path: 'employees',
    loadComponent: () => import('./employee-report/employee-report.component').then(m => m.EmployeeReportComponent),
  },
];
