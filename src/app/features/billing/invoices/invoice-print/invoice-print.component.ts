import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { InvoicePdfService } from '../../../../core/services/invoice-pdf.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { InvoiceDetail } from '../../../../core/models/invoice.models';
import { InvoiceDocumentComponent } from '../invoice-document/invoice-document.component';

import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({
  selector: 'app-invoice-print',
  standalone: true,
  imports: [
    SkeletonLoaderComponent,
    NgIf,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    InvoiceDocumentComponent,
  ],
  templateUrl: './invoice-print.component.html',
  styleUrl: './invoice-print.component.less',
})
export class InvoicePrintComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly invoiceService = inject(InvoiceService);
  private readonly invoicePdfService = inject(InvoicePdfService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(true);
  readonly downloading = signal(false);
  readonly invoice = signal<InvoiceDetail | null>(null);
  readonly documentRef = viewChild(InvoiceDocumentComponent);

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.invoiceService.getById(id).subscribe({
      next: (detail) => {
        this.invoice.set(detail);
        this.loading.set(false);
        if (this.route.snapshot.queryParamMap.get('autoprint') === '1') {
          setTimeout(() => window.print(), 400);
        }
        if (this.route.snapshot.queryParamMap.get('pdf') === '1') {
          setTimeout(() => this.downloadPdf(), 500);
        }
      },
      error: () => this.loading.set(false),
    });
  }

  print() {
    window.print();
  }

  async downloadPdf() {
    const inv = this.invoice();
    if (!inv || this.downloading()) return;

    this.downloading.set(true);
    try {
      const host = document.querySelector('app-invoice-document .invoice-document') as HTMLElement | null;
      if (host) {
        await this.invoicePdfService.saveElementAsPdf(host, `${inv.invoiceNumber}.pdf`);
      } else {
        await this.invoicePdfService.downloadInvoice(inv);
      }
      this.notification.success('Invoice PDF downloaded.');
    } catch {
      this.notification.error('Failed to generate PDF. Try Print / Save PDF instead.');
    } finally {
      this.downloading.set(false);
    }
  }
}
