import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { InvoiceDocumentComponent } from '../invoice-document/invoice-document.component';
import { InvoicePrintRoutingModule } from './invoice-print-routing.module';
import { InvoicePrintComponent } from './invoice-print.component';

@NgModule({
  declarations: [InvoicePrintComponent, InvoiceDocumentComponent],
  imports: [SharedModule, InvoicePrintRoutingModule],
})
export class InvoicePrintModule {}
