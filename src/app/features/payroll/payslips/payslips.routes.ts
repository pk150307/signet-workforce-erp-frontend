import { Routes } from '@angular/router';

export const PAYSLIP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./payslip-list/payslip-list.component').then(m => m.PayslipListComponent),
  },
  {
    path: 'generate',
    data: { breadcrumb: 'Generate Payslips' },
    loadComponent: () => import('./payslip-generate/payslip-generate.component').then(m => m.PayslipGenerateComponent),
  },
  {
    path: ':id',
    data: { breadcrumb: 'Payslip Details' },
    loadComponent: () => import('./payslip-detail/payslip-detail.component').then(m => m.PayslipDetailComponent),
  },
];
