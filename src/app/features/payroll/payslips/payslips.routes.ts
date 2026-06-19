import { Routes } from '@angular/router';

export const PAYSLIP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./payslip-list/payslip-list.component').then(m => m.PayslipListComponent),
  },
  {
    path: 'generate',
    loadComponent: () => import('./payslip-generate/payslip-generate.component').then(m => m.PayslipGenerateComponent),
  },
  {
    path: ':id/print',
    loadComponent: () => import('./payslip-print/payslip-print.component').then(m => m.PayslipPrintComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./payslip-detail/payslip-detail.component').then(m => m.PayslipDetailComponent),
  },
];
