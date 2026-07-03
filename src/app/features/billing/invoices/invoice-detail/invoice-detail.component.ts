import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass, NgFor, NgIf, DecimalPipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { InvoicePdfService } from '../../../../core/services/invoice-pdf.service';
import { BillingPaymentService } from '../../../../core/services/billing-payment.service';
import { BillingAuditService } from '../../../../core/services/billing-audit.service';
import { BillingFilterService } from '../../../../core/services/billing-filter.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { confirmDialogConfig } from '../../../../core/utils/dialog.util';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { InvoiceDetail, InvoiceStatus } from '../../../../core/models/invoice.models';
import { InvoiceActivityEntry, InvoicePayment, InvoicePaymentSummary } from '../../../../core/models/billing.models';
import { getInvoiceStatusClass } from '../invoice.mock';
import { mapInvoiceStatusLabel } from '../../../../core/utils/api-response.util';
import { ApiDatePipe } from '../../../../shared/pipes/api-date.pipe';
import { BillingSubnavComponent } from '../../shared/billing-subnav.component';
import { InvoicePaymentDialogComponent } from '../invoice-payment-dialog/invoice-payment-dialog.component';

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
    UpperCasePipe,
    RouterLink,
    ApiDatePipe,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatMenuModule,
    SkeletonLoaderComponent,
    BillingSubnavComponent,
  ],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.less',
})
export class InvoiceDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly invoiceService = inject(InvoiceService);
  private readonly invoicePdfService = inject(InvoicePdfService);
  private readonly paymentService = inject(BillingPaymentService);
  private readonly auditService = inject(BillingAuditService);
  private readonly billingFilter = inject(BillingFilterService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly loadingPayments = signal(false);
  readonly downloadingPdf = signal(false);
  readonly notFound = signal(false);
  readonly invoice = signal<InvoiceDetail | null>(null);
  readonly payments = signal<InvoicePayment[]>([]);
  readonly paymentSummary = signal<InvoicePaymentSummary | null>(null);
  readonly activity = signal<InvoiceActivityEntry[]>([]);
  readonly statusLabel = mapInvoiceStatusLabel;

  getStatusClass = getInvoiceStatusClass;

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.loadInvoice(id);

    // The shared billing filter bar (client / month / year) can't narrow a single
    // invoice, so applying a filter here takes the user to the filtered invoice list.
    this.billingFilter.filterChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.router.navigate(['/billing/invoices']));
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
        this.loadPayments(id);
        this.loadActivity(id);
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
      Generated: [
        { status: 'Approved', label: 'Approve', icon: 'verified', color: 'primary' },
        { status: 'Sent', label: 'Mark as Sent', icon: 'send' },
        { status: 'Cancelled', label: 'Cancel', icon: 'cancel', color: 'warn' },
      ],
      Approved: [
        { status: 'Sent', label: 'Mark as Sent', icon: 'send' },
        { status: 'Archived', label: 'Archive', icon: 'inventory_2' },
      ],
      Archived: [],
    };
    return map[inv.status] ?? [];
  }

  canEdit(inv: InvoiceDetail): boolean {
    return inv.status === 'Draft' && !inv.isLocked;
  }

  canRecordPayment(inv: InvoiceDetail): boolean {
    return inv.balanceAmount > 0 && inv.status !== 'Cancelled' && inv.status !== 'Archived';
  }

  loadPayments(invoiceId: string) {
    this.loadingPayments.set(true);
    this.paymentService.listByInvoice(invoiceId).subscribe({
      next: items => { this.payments.set(items); this.loadingPayments.set(false); },
      error: () => this.loadingPayments.set(false),
    });
    this.paymentService.getSummary(invoiceId).subscribe({
      next: summary => this.paymentSummary.set(summary),
    });
  }

  loadActivity(invoiceId: string) {
    this.auditService.getActivity(invoiceId).subscribe({
      next: entries => this.activity.set(entries),
    });
  }

  recordPayment() {
    const inv = this.invoice();
    if (!inv) return;

    this.dialog.open(InvoicePaymentDialogComponent, {
      width: '420px',
      data: { invoiceId: inv.id, balanceAmount: inv.balanceAmount },
    }).afterClosed().subscribe(result => {
      if (!result) return;
      this.paymentService.record(inv.id, {
        paymentDate: result.paymentDate,
        amount: result.amount,
        paymentMode: result.paymentMode,
        utrNumber: result.utrNumber || undefined,
        remarks: result.remarks || undefined,
      }).subscribe({
        next: ({ summary }) => {
          this.paymentSummary.set(summary);
          this.notification.success('Payment recorded.');
          this.loadPayments(inv.id);
          this.loadInvoice(inv.id);
        },
        error: (err) => this.notification.error(err?.error?.message ?? 'Failed to record payment.'),
      });
    });
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
