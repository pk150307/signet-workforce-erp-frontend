import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    loadChildren: () => import('./layout/layout.routes').then(m => m.LAYOUT_ROUTES),
  },

  {
    path: 'print/billing/invoices/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/billing/invoices/invoice-print/invoice-print.component').then(m => m.InvoicePrintComponent),
  },

  {
    path: 'print/payroll/payslips/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/payroll/payslips/payslip-print/payslip-print.component').then(m => m.PayslipPrintComponent),
  },

  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
