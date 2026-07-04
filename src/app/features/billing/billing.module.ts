import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { BillingModuleRoutingModule } from './billing-routing.module';
import { BillingConfigurationFormComponent } from './configuration/billing-configuration-form/billing-configuration-form.component';
import { BillingConfigurationListComponent } from './configuration/billing-configuration-list/billing-configuration-list.component';
import { ContractFormComponent } from './contracts/contract-form/contract-form.component';
import { ContractListComponent } from './contracts/contract-list/contract-list.component';
import { InvoiceDashboardComponent } from './dashboard/invoice-dashboard/invoice-dashboard.component';
import { InvoiceDetailComponent } from './invoices/invoice-detail/invoice-detail.component';
import { InvoiceFormComponent } from './invoices/invoice-form/invoice-form.component';
import { InvoiceGenerateComponent } from './invoices/invoice-generate/invoice-generate.component';
import { InvoiceListComponent } from './invoices/invoice-list/invoice-list.component';
import { InvoicePaymentDialogComponent } from './invoices/invoice-payment-dialog/invoice-payment-dialog.component';
import { BillingReportsComponent } from './reports/billing-reports/billing-reports.component';
import { BillingPrerequisitesComponent } from './shared/billing-prerequisites/billing-prerequisites.component';
import { BillingSubnavComponent } from './shared/billing-subnav/billing-subnav.component';

@NgModule({
  declarations: [
    BillingConfigurationFormComponent,
    BillingConfigurationListComponent,
    ContractFormComponent,
    ContractListComponent,
    InvoiceDashboardComponent,
    InvoiceDetailComponent,
    InvoiceFormComponent,
    InvoiceGenerateComponent,
    InvoiceListComponent,
    InvoicePaymentDialogComponent,
    BillingReportsComponent,
    BillingPrerequisitesComponent,
    BillingSubnavComponent,
  ],
  imports: [
    SharedModule,
    BillingModuleRoutingModule,
  ],
})
export class BillingModule {}
