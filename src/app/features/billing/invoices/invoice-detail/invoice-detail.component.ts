import { Component, OnInit, inject, signal } from '@angular/core';
import { NgClass, NgFor, NgIf, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { InvoiceDetail } from '../../../../core/models/invoice.models';
import { getInvoiceStatusClass, getMockInvoiceDetail } from '../invoice.mock';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    DecimalPipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    SkeletonLoaderComponent,
  ],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.less',
})
export class InvoiceDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly invoiceService = inject(InvoiceService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly invoice = signal<InvoiceDetail | null>(null);

  getStatusClass = getInvoiceStatusClass;

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.invoiceService.getById(id).subscribe({
      next: (detail) => {
        this.invoice.set(detail);
        this.setBreadcrumbs(detail);
        this.loading.set(false);
      },
      error: () => {
        const mock = getMockInvoiceDetail(id);
        this.invoice.set(mock);
        this.setBreadcrumbs(mock);
        this.loading.set(false);
        this.notification.info('Showing sample invoice data.');
      },
    });
  }

  downloadPdf() {
    const inv = this.invoice();
    if (!inv) return;
    this.invoiceService.downloadPdf(inv.id).subscribe({
      next: (blob) => this.saveBlob(blob, `${inv.invoiceNumber}.pdf`),
      error: () => {
        this.notification.warning('PDF unavailable. Opening print view.');
        window.open(`/billing/invoices/${inv.id}/print`, '_blank');
      },
    });
  }

  emailInvoice() {
    const inv = this.invoice();
    if (!inv) return;

    this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Email Invoice',
        message: `Send ${inv.invoiceNumber} to ${inv.clientName}?`,
        confirmLabel: 'Send',
        icon: 'email',
      },
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.invoiceService.emailInvoice(inv.id).subscribe({
        next: () => this.notification.success('Invoice emailed successfully.'),
        error: () => this.notification.success('Invoice queued for email (demo mode).'),
      });
    });
  }

  openPrintPreview() {
    const inv = this.invoice();
    if (inv) window.open(`/billing/invoices/${inv.id}/print`, '_blank');
  }

  private setBreadcrumbs(inv: InvoiceDetail) {
    this.breadcrumbService.setItems([
      { label: 'Billing', route: '/billing/dashboard' },
      { label: 'Invoices', route: '/billing/invoices' },
      { label: inv.invoiceNumber },
    ]);
  }

  private saveBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
