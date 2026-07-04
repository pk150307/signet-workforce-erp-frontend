import { Component, OnInit, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { InvoicePdfService } from '../../../../core/services/invoice-pdf.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { InvoiceDetail } from '../../../../core/models/invoice.models';
@Component({
  selector: 'app-invoice-print',
    templateUrl: './invoice-print.component.html',
  styleUrl: './invoice-print.component.less',
})
export class InvoicePrintComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly invoiceService = inject(InvoiceService);
  private readonly invoicePdfService = inject(InvoicePdfService);
  private readonly notification = inject(NotificationService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly loading = signal(true);
  readonly downloading = signal(false);
  readonly invoice = signal<InvoiceDetail | null>(null);
  readonly serverHtml = signal<SafeHtml | null>(null);
  readonly useServerHtml = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.invoiceService.getById(id).subscribe({
      next: (detail) => this.invoice.set(detail),
    });

    this.invoiceService.getPrintHtml(id).subscribe({
      next: (html) => {
        this.serverHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));
        this.useServerHtml.set(true);
        this.loading.set(false);
        this.scheduleAutoActions();
      },
      error: () => {
        this.useServerHtml.set(false);
        if (!this.invoice()) {
          this.invoiceService.getById(id).subscribe({
            next: (detail) => {
              this.invoice.set(detail);
              this.loading.set(false);
              this.scheduleAutoActions();
            },
            error: () => this.loading.set(false),
          });
        } else {
          this.loading.set(false);
          this.scheduleAutoActions();
        }
      },
    });
  }

  private scheduleAutoActions() {
    if (this.route.snapshot.queryParamMap.get('autoprint') === '1') {
      setTimeout(() => window.print(), 400);
    }
    if (this.route.snapshot.queryParamMap.get('pdf') === '1') {
      setTimeout(() => this.downloadPdf(), 500);
    }
  }

  print() {
    window.print();
  }

  async downloadPdf() {
    const inv = this.invoice();
    if (this.downloading()) return;

    this.downloading.set(true);
    try {
      const host = document.querySelector('.invoice-preview-wrap .invoice-document, .server-invoice-html') as HTMLElement | null;
      const filename = inv ? `${inv.invoiceNumber}.pdf` : 'invoice.pdf';
      if (host) {
        await this.invoicePdfService.saveElementAsPdf(host, filename);
      } else if (inv) {
        await this.invoicePdfService.downloadInvoice(inv);
      } else {
        throw new Error('No preview available');
      }
      this.notification.success('Invoice PDF downloaded.');
    } catch {
      this.notification.error('Failed to generate PDF. Try Print / Save PDF instead.');
    } finally {
      this.downloading.set(false);
    }
  }
}
