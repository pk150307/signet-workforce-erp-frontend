import { Routes } from '@angular/router';

export const BILLING_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    data: { breadcrumb: 'Dashboard' },
    loadComponent: () => import('./dashboard/invoice-dashboard/invoice-dashboard.component').then(m => m.InvoiceDashboardComponent),
  },
  {
    path: 'invoices',
    data: { breadcrumb: 'Invoices' },
    loadComponent: () => import('./invoices/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent),
  },
  {
    path: 'invoices/new',
    data: {
      breadcrumb: [
        { label: 'Invoices', route: '/billing/invoices' },
        'Create Invoice',
      ],
    },
    loadComponent: () => import('./invoices/invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent),
  },
  {
    path: 'invoices/generate',
    data: {
      breadcrumb: [
        { label: 'Invoices', route: '/billing/invoices' },
        'Generate Invoices',
      ],
    },
    loadComponent: () => import('./invoices/invoice-generate/invoice-generate.component').then(m => m.InvoiceGenerateComponent),
  },
  {
    path: 'invoices/:id/edit',
    data: {
      breadcrumb: [
        { label: 'Invoices', route: '/billing/invoices' },
        'Edit Invoice',
      ],
    },
    loadComponent: () => import('./invoices/invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent),
  },
  {
    path: 'invoices/:id',
    data: {
      breadcrumb: [
        { label: 'Invoices', route: '/billing/invoices' },
        'Invoice Details',
      ],
    },
    loadComponent: () => import('./invoices/invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent),
  },
];
