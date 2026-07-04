import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./layout/layout.module').then((m) => m.LayoutModule),
  },
  {
    path: 'print/billing/invoices/:id',
    canActivate: [authGuard],
    loadChildren: () => import('./features/billing/invoices/invoice-print/invoice-print.module').then((m) => m.InvoicePrintModule),
  },
  {
    path: 'print/payroll/payslips/:id',
    canActivate: [authGuard],
    loadChildren: () => import('./features/payroll/payslips/payslip-print/payslip-print.module').then((m) => m.PayslipPrintModule),
  },
  {
    path: '**',
    loadChildren: () => import('./pages/pages.module').then((m) => m.PagesModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    bindToComponentInputs: true,
    enableViewTransitions: true,
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
