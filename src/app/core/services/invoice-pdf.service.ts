import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { InvoiceDetail } from '../models/invoice.models';
import { InvoiceDocumentComponent } from '../../features/billing/invoices/invoice-document/invoice-document.component';
import { InvoiceService } from './invoice.service';
import { PdfExportService } from './pdf-export.service';

@Injectable({ providedIn: 'root' })
export class InvoicePdfService {
  private readonly invoiceService = inject(InvoiceService);
  private readonly pdfExport = inject(PdfExportService);

  downloadById(invoiceId: string): Promise<void> {
    return firstValueFrom(this.invoiceService.getById(invoiceId)).then(invoice =>
      this.downloadInvoice(invoice),
    );
  }

  downloadInvoice(invoice: InvoiceDetail): Promise<void> {
    return this.pdfExport.renderComponentAsPdf({
      component: InvoiceDocumentComponent,
      inputs: { inv: invoice },
      selector: '.invoice-document',
      filename: `${invoice.invoiceNumber}.pdf`,
      width: '920px',
    });
  }

  async downloadMany(invoiceIds: string[], filename: string): Promise<void> {
    const invoices: InvoiceDetail[] = [];
    for (const id of invoiceIds) {
      invoices.push(await firstValueFrom(this.invoiceService.getById(id)));
    }

    await this.pdfExport.renderManyComponentsAsSinglePdf(
      invoices.map(inv => ({
        component: InvoiceDocumentComponent,
        inputs: { inv },
        selector: '.invoice-document',
        filename: `${inv.invoiceNumber}.pdf`,
        width: '920px',
      })),
      filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
    );
  }

  saveElementAsPdf(element: HTMLElement, filename: string): Promise<void> {
    return this.pdfExport.saveElementAsPdf(element, filename);
  }
}
