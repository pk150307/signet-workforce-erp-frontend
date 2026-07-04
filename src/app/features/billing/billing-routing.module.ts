import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceDashboardComponent } from './dashboard/invoice-dashboard/invoice-dashboard.component';
import { InvoiceListComponent } from './invoices/invoice-list/invoice-list.component';
import { InvoiceFormComponent } from './invoices/invoice-form/invoice-form.component';
import { InvoiceGenerateComponent } from './invoices/invoice-generate/invoice-generate.component';
import { InvoiceDetailComponent } from './invoices/invoice-detail/invoice-detail.component';
import { BillingConfigurationListComponent } from './configuration/billing-configuration-list/billing-configuration-list.component';
import { BillingConfigurationFormComponent } from './configuration/billing-configuration-form/billing-configuration-form.component';
import { ContractListComponent } from './contracts/contract-list/contract-list.component';
import { ContractFormComponent } from './contracts/contract-form/contract-form.component';
import { BillingReportsComponent } from './reports/billing-reports/billing-reports.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    data: { breadcrumb: 'Dashboard' },
    component: InvoiceDashboardComponent,
  },
  {
    path: 'invoices',
    data: { breadcrumb: 'Invoices' },
    component: InvoiceListComponent,
  },
  {
    path: 'invoices/new',
    data: {
      breadcrumb: [
        { label: 'Invoices', route: '/billing/invoices' },
        'Create Invoice',
      ],
    },
    component: InvoiceFormComponent,
  },
  {
    path: 'invoices/generate',
    data: {
      breadcrumb: [
        { label: 'Invoices', route: '/billing/invoices' },
        'Generate Invoices',
      ],
    },
    component: InvoiceGenerateComponent,
  },
  {
    path: 'invoices/:id/edit',
    data: {
      breadcrumb: [
        { label: 'Invoices', route: '/billing/invoices' },
        'Edit Invoice',
      ],
    },
    component: InvoiceFormComponent,
  },
  {
    path: 'invoices/:id',
    data: {
      breadcrumb: [
        { label: 'Invoices', route: '/billing/invoices' },
        'Invoice Details',
      ],
    },
    component: InvoiceDetailComponent,
  },
  {
    path: 'configurations',
    data: { breadcrumb: 'Billing Configuration' },
    component: BillingConfigurationListComponent,
  },
  {
    path: 'configurations/new',
    data: {
      breadcrumb: [
        { label: 'Configuration', route: '/billing/configurations' },
        'New Configuration',
      ],
    },
    component: BillingConfigurationFormComponent,
  },
  {
    path: 'configurations/:id/edit',
    data: {
      breadcrumb: [
        { label: 'Configuration', route: '/billing/configurations' },
        'Edit Configuration',
      ],
    },
    component: BillingConfigurationFormComponent,
  },
  {
    path: 'contracts',
    data: { breadcrumb: 'Contracts' },
    component: ContractListComponent,
  },
  {
    path: 'contracts/new',
    data: {
      breadcrumb: [
        { label: 'Contracts', route: '/billing/contracts' },
        'New Contract',
      ],
    },
    component: ContractFormComponent,
  },
  {
    path: 'contracts/:id/edit',
    data: {
      breadcrumb: [
        { label: 'Contracts', route: '/billing/contracts' },
        'Edit Contract',
      ],
    },
    component: ContractFormComponent,
  },
  {
    path: 'reports',
    data: { breadcrumb: 'Billing Reports' },
    component: BillingReportsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BillingModuleRoutingModule {}
