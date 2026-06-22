import { Component, OnInit, inject, signal } from '@angular/core';
import { NgClass, NgFor, NgIf, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { InvoicePdfService } from '../../../../core/services/invoice-pdf.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { confirmDialogConfig } from '../../../../core/utils/dialog.util';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { InvoiceDetail, InvoiceStatus } from '../../../../core/models/invoice.models';
import { getInvoiceStatusClass } from '../invoice.mock';
import { mapInvoiceStatusLabel } from '../../../../core/utils/api-response.util';
import { ApiDatePipe } from '../../../../shared/pipes/api-date.pipe';

interface StatusAction {
  status: InvoiceStatus;
  label: string;
  icon: string;
  color?: 'primary' | 'warn';
}

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DecimalPipe,
    RouterLink,
    ApiDatePipe,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatMenuModule,
    SkeletonLoaderComponent,
  ],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.less',
})
export class InvoiceDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly invoiceService = inject(InvoiceService);
  private readonly invoicePdfService = inject(InvoicePdfService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly downloadingPdf = signal(false);
  readonly notFound = signal(false);
  readonly invoice = signal<InvoiceDetail | null>(null);
  readonly statusLabel = mapInvoiceStatusLabel;

  getStatusClass = getInvoiceStatusClass;

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.loadInvoice(id);
  }

  loadInvoice(id: string) {
    this.loading.set(true);
    this.invoiceService.getById(id).subscribe({
      next: (detail) => {
        if (!detail?.id) {
          this.notFound.set(true);
          this.loading.set(false);
          return;
        }
        this.invoice.set(detail);
        this.setBreadcrumbs(detail);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
        this.notification.error('Failed to load invoice.');
      },
    });
  }

  availableActions(inv: InvoiceDetail): StatusAction[] {
    const map: Record<InvoiceStatus, StatusAction[]> = {
      Draft: [
        { status: 'Sent', label: 'Mark as Sent', icon: 'send' },
        { status: 'Cancelled', label: 'Cancel', icon: 'cancel', color: 'warn' },
      ],
      Sent: [
        { status: 'Viewed', label: 'Mark as Viewed', icon: 'visibility' },
        { status: 'PartiallyPaid', label: 'Partial Payment', icon: 'payments' },
        { status: 'Paid', label: 'Mark as Paid', icon: 'check_circle', color: 'primary' },
        { status: 'Overdue', label: 'Mark Overdue', icon: 'schedule', color: 'warn' },
        { status: 'Cancelled', label: 'Cancel', icon: 'cancel', color: 'warn' },
      ],
      Viewed: [
        { status: 'PartiallyPaid', label: 'Partial Payment', icon: 'payments' },
        { status: 'Paid', label: 'Mark as Paid', icon: 'check_circle', color: 'primary' },
        { status: 'Overdue', label: 'Mark Overdue', icon: 'schedule', color: 'warn' },
        { status: 'Cancelled', label: 'Cancel', icon: 'cancel', color: 'warn' },
      ],
      PartiallyPaid: [
        { status: 'Paid', label: 'Mark as Paid', icon: 'check_circle', color: 'primary' },
        { status: 'Overdue', label: 'Mark Overdue', icon: 'schedule', color: 'warn' },
        { status: 'Cancelled', label: 'Cancel', icon: 'cancel', color: 'warn' },
      ],
      Paid: [],
      Overdue: [
        { status: 'PartiallyPaid', label: 'Partial Payment', icon: 'payments' },
        { status: 'Paid', label: 'Mark as Paid', icon: 'check_circle', color: 'primary' },
        { status: 'Cancelled', label: 'Cancel', icon: 'cancel', color: 'warn' },
      ],
      Cancelled: [],
    };
    return map[inv.status] ?? [];
  }

  canEdit(inv: InvoiceDetail): boolean {
    return inv.status === 'Draft';
  }

  transitionStatus(action: StatusAction) {
    const inv = this.invoice();
    if (!inv) return;

    let paidAmount: number | undefined;
    if (action.status === 'Paid') {
      paidAmount = inv.totalAmount;
    } else if (action.status === 'PartiallyPaid') {
      const input = prompt('Enter paid amount:', String(Math.round(inv.totalAmount / 2)));
      if (input == null) return;
      paidAmount = Number(input);
      if (!paidAmount || paidAmount >= inv.totalAmount) {
        this.notification.warning('Enter an amount greater than 0 and less than total.');
        return;
      }
    }

    this.invoiceService.updateStatus(inv.id, { status: action.status, paidAmount }).subscribe({
      next: (updated) => {
        this.invoice.set(updated);
        this.notification.success(`Invoice marked as ${this.statusLabel(action.status)}.`);
      },
      error: (err) => this.notification.error(err?.error?.message ?? 'Status update failed.'),
    });
  }

  deleteInvoice() {
    const inv = this.invoice();
    if (!inv) return;

    const statusNote = inv.status !== 'Draft' && inv.status !== 'Cancelled'
      ? ` This invoice is marked as ${this.statusLabel(inv.status)}.`
      : '';

    this.dialog.open(
      ConfirmDialogComponent,
      confirmDialogConfig({
        title: 'Delete Invoice',
        message: `Delete ${inv.invoiceNumber}?${statusNote} This action cannot be undone.`,
        confirmLabel: 'Delete',
        icon: 'delete',
        confirmColor: 'warn',
      }),
    ).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.invoiceService.delete(inv.id).subscribe({
        next: () => {
          this.notification.success('Invoice deleted.');
          this.router.navigate(['/billing/invoices']);
        },
        error: (err) => this.notification.error(err?.error?.message ?? 'Delete failed.'),
      });
    });
  }

  downloadPdf() {
    const inv = this.invoice();
    if (!inv || this.downloadingPdf()) return;

    this.downloadingPdf.set(true);
    this.invoicePdfService.downloadInvoice(inv).then(() => {
      this.notification.success('Invoice PDF downloaded.');
    }).catch(() => {
      this.notification.error('Failed to generate PDF.');
    }).finally(() => {
      this.downloadingPdf.set(false);
    });
  }

  emailInvoice() {
    const inv = this.invoice();
    if (!inv) return;

    this.dialog.open(
      ConfirmDialogComponent,
      confirmDialogConfig({
        title: 'Email Invoice',
        message: `Send ${inv.invoiceNumber} to ${inv.clientName}? Status will update to Sent.`,
        confirmLabel: 'Send',
        icon: 'email',
      }),
    ).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.invoiceService.emailInvoice(inv.id).subscribe({
        next: () => {
          this.notification.success('Invoice emailed successfully.');
          this.loadInvoice(inv.id);
        },
        error: () => this.notification.error('Failed to email invoice.'),
      });
    });
  }

  openPrintPreview(download = false) {
    const inv = this.invoice();
    if (!inv) return;
    const url = `${this.invoiceService.getPrintUrl(inv.id)}${download ? '?autoprint=1' : ''}`;
    window.open(url, '_blank');
  }

  private setBreadcrumbs(inv: InvoiceDetail) {
    this.breadcrumbService.updateLast(inv.invoiceNumber);
  }
}
