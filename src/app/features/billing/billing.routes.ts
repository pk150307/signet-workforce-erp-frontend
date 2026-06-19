import { Routes } from '@angular/router';

export const BILLING_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/invoice-dashboard/invoice-dashboard.component').then(m => m.InvoiceDashboardComponent),
  },
  {
    path: 'invoices',
    loadComponent: () => import('./invoices/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent),
  },
  {
    path: 'invoices/new',
    loadComponent: () => import('./invoices/invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent),
  },
  {
    path: 'invoices/generate',
    loadComponent: () => import('./invoices/invoice-generate/invoice-generate.component').then(m => m.InvoiceGenerateComponent),
  },
  {
    path: 'invoices/:id/print',
    loadComponent: () => import('./invoices/invoice-print/invoice-print.component').then(m => m.InvoicePrintComponent),
  },
  {
    path: 'invoices/:id',
    loadComponent: () => import('./invoices/invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent),
  },
];
