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
  {
    path: 'configurations',
    data: { breadcrumb: 'Billing Configuration' },
    loadComponent: () => import('./configuration/billing-configuration-list/billing-configuration-list.component').then(m => m.BillingConfigurationListComponent),
  },
  {
    path: 'configurations/new',
    data: {
      breadcrumb: [
        { label: 'Configuration', route: '/billing/configurations' },
        'New Configuration',
      ],
    },
    loadComponent: () => import('./configuration/billing-configuration-form/billing-configuration-form.component').then(m => m.BillingConfigurationFormComponent),
  },
  {
    path: 'configurations/:id/edit',
    data: {
      breadcrumb: [
        { label: 'Configuration', route: '/billing/configurations' },
        'Edit Configuration',
      ],
    },
    loadComponent: () => import('./configuration/billing-configuration-form/billing-configuration-form.component').then(m => m.BillingConfigurationFormComponent),
  },
  {
    path: 'contracts',
    data: { breadcrumb: 'Contracts' },
    loadComponent: () => import('./contracts/contract-list/contract-list.component').then(m => m.ContractListComponent),
  },
  {
    path: 'contracts/new',
    data: {
      breadcrumb: [
        { label: 'Contracts', route: '/billing/contracts' },
        'New Contract',
      ],
    },
    loadComponent: () => import('./contracts/contract-form/contract-form.component').then(m => m.ContractFormComponent),
  },
  {
    path: 'contracts/:id/edit',
    data: {
      breadcrumb: [
        { label: 'Contracts', route: '/billing/contracts' },
        'Edit Contract',
      ],
    },
    loadComponent: () => import('./contracts/contract-form/contract-form.component').then(m => m.ContractFormComponent),
  },
  {
    path: 'reports',
    data: { breadcrumb: 'Billing Reports' },
    loadComponent: () => import('./reports/billing-reports/billing-reports.component').then(m => m.BillingReportsComponent),
  },
];
