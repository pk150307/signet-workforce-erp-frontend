import { Routes } from '@angular/router';

export const PAYROLL_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'Payroll Runs' },
    loadComponent: () => import('./payroll-runs/payroll-runs.component').then(m => m.PayrollRunsComponent),
  },
  {
    path: 'payslips',
    data: { breadcrumb: { label: 'Salary Slips', route: '/payroll/payslips' } },
    loadChildren: () => import('./payslips/payslips.routes').then(m => m.PAYSLIP_ROUTES),
  },
];
