import { Routes } from '@angular/router';

export const PAYROLL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./payroll-runs/payroll-runs.component').then(m => m.PayrollRunsComponent),
  },
  {
    path: 'payslips',
    loadChildren: () => import('./payslips/payslips.routes').then(m => m.PAYSLIP_ROUTES),
  },
];
