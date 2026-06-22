import { Component, OnInit, inject, signal } from '@angular/core';
import { NgClass, NgFor, NgIf, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { InvoicePdfService } from '../../../../core/services/invoice-pdf.service';
import { ClientsService } from '../../../../core/services/clients.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { confirmDialogConfig } from '../../../../core/utils/dialog.util';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { PaginatedResult } from '../../../../core/models/api.models';
import { InvoiceListItem, InvoiceStatus } from '../../../../core/models/invoice.models';
import { ClientListItem } from '../../../../core/models/client.models';
import { INVOICE_STATUS_OPTIONS, getInvoiceStatusClass, getMockInvoiceList } from '../invoice.mock';
import { ApiDatePipe } from '../../../../shared/pipes/api-date.pipe';
import { mapInvoiceStatusLabel } from '../../../../core/utils/api-response.util';

interface StatusAction {
  status: InvoiceStatus;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DecimalPipe,
    RouterLink,
    ApiDatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatCheckboxModule,
    EmptyStateComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.less',
})
export class InvoiceListComponent implements OnInit {

  private readonly invoiceService = inject(InvoiceService);
  private readonly invoicePdfService = inject(InvoicePdfService);
  private readonly clientsService = inject(ClientsService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly downloadingPdf = signal(false);
  readonly usingMock = signal(false);
  readonly data = signal<PaginatedResult<InvoiceListItem> | null>(null);
  readonly clients = signal<ClientListItem[]>([]);
  readonly selection = new SelectionModel<InvoiceListItem>(true, []);

  readonly statusOptions = INVOICE_STATUS_OPTIONS;
  readonly searchCtrl = new FormControl('');
  readonly statusCtrl = new FormControl<InvoiceStatus | null>(null);
  readonly clientCtrl = new FormControl<string | null>(null);
  readonly monthCtrl = new FormControl<number>(this.currentMonth());
  readonly yearCtrl = new FormControl<number>(this.currentYear());

  readonly years = this.buildYearOptions();
  readonly displayedColumns = ['select', 'invoiceNumber', 'client', 'invoiceDate', 'dueDate', 'totalAmount', 'status', 'actions'];
  readonly statusLabel = mapInvoiceStatusLabel;

  page = 1;
  pageSize = 20;

  pageTotal = () => (this.data()?.items ?? []).reduce((s, i) => s + i.totalAmount, 0);
  paidCount = () => (this.data()?.items ?? []).filter(i => i.status === 'Paid').length;
  overdueCount = () => (this.data()?.items ?? []).filter(i => i.status === 'Overdue').length;

  monthLabel(m: number): string {
    return new Date(2000, m - 1, 1).toLocaleString('en-US', { month: 'short' });
  }

  ngOnInit() {
    this.loadData();

    this.clientsService.getAllForSelect().subscribe({
      next: clients => this.clients.set(clients),
    });

    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.loadData();
    });

    this.statusCtrl.valueChanges.subscribe(() => { this.page = 1; this.loadData(); });
    this.clientCtrl.valueChanges.subscribe(() => { this.page = 1; this.loadData(); });
    this.monthCtrl.valueChanges.subscribe(() => { this.page = 1; this.loadData(); });
    this.yearCtrl.valueChanges.subscribe(() => { this.page = 1; this.loadData(); });
  }

  loadData() {
    this.loading.set(true);
    this.selection.clear();

    this.invoiceService.getAll({
      page: this.page,
      pageSize: this.pageSize,
      ...this.currentQuery(),
    }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.usingMock.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.data.set(getMockInvoiceList(this.page, this.pageSize));
        this.usingMock.set(true);
        this.loading.set(false);
        this.notification.info('Showing sample invoice data.');
      },
    });
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  setStatusFilter(status: InvoiceStatus | null) {
    this.statusCtrl.setValue(status);
  }

  isAllSelected(): boolean {
    const items = this.data()?.items ?? [];
    return items.length > 0 && this.selection.selected.length === items.length;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...(this.data()?.items ?? []));
    }
  }

  getStatusClass = getInvoiceStatusClass;

  availableActions(item: InvoiceListItem): StatusAction[] {
    const map: Record<InvoiceStatus, StatusAction[]> = {
      Draft: [
        { status: 'Sent', label: 'Mark as Sent', icon: 'send' },
        { status: 'Cancelled', label: 'Cancel', icon: 'cancel' },
      ],
      Sent: [
        { status: 'Viewed', label: 'Mark as Viewed', icon: 'visibility' },
        { status: 'PartiallyPaid', label: 'Partial Payment', icon: 'payments' },
        { status: 'Paid', label: 'Mark as Paid', icon: 'check_circle' },
        { status: 'Overdue', label: 'Mark Overdue', icon: 'schedule' },
        { status: 'Cancelled', label: 'Cancel', icon: 'cancel' },
      ],
      Viewed: [
        { status: 'PartiallyPaid', label: 'Partial Payment', icon: 'payments' },
        { status: 'Paid', label: 'Mark as Paid', icon: 'check_circle' },
        { status: 'Overdue', label: 'Mark Overdue', icon: 'schedule' },
        { status: 'Cancelled', label: 'Cancel', icon: 'cancel' },
      ],
      PartiallyPaid: [
        { status: 'Paid', label: 'Mark as Paid', icon: 'check_circle' },
        { status: 'Overdue', label: 'Mark Overdue', icon: 'schedule' },
        { status: 'Cancelled', label: 'Cancel', icon: 'cancel' },
      ],
      Paid: [],
      Overdue: [
        { status: 'PartiallyPaid', label: 'Partial Payment', icon: 'payments' },
        { status: 'Paid', label: 'Mark as Paid', icon: 'check_circle' },
        { status: 'Cancelled', label: 'Cancel', icon: 'cancel' },
      ],
      Cancelled: [],
    };
    return map[item.status] ?? [];
  }

  viewInvoice(id: string) {
    this.router.navigate(['/billing/invoices', id]);
  }

  transitionStatus(item: InvoiceListItem, action: StatusAction) {
    let paidAmount: number | undefined;
    if (action.status === 'Paid') {
      paidAmount = item.totalAmount;
    } else if (action.status === 'PartiallyPaid') {
      const input = prompt('Enter paid amount:', String(Math.round(item.totalAmount / 2)));
      if (input == null) return;
      paidAmount = Number(input);
      if (!paidAmount || paidAmount >= item.totalAmount) {
        this.notification.warning('Enter an amount greater than 0 and less than total.');
        return;
      }
    }

    this.invoiceService.updateStatus(item.id, { status: action.status, paidAmount }).subscribe({
      next: () => {
        this.notification.success(`Invoice marked as ${this.statusLabel(action.status)}.`);
        this.loadData();
      },
      error: (err) => this.notification.error(err?.error?.detail ?? err?.error?.message ?? 'Status update failed.'),
    });
  }

  downloadPdf(item: InvoiceListItem) {
    this.notification.info('Generating PDF…');
    this.invoicePdfService.downloadById(item.id).then(() => {
      this.notification.success(`${item.invoiceNumber}.pdf downloaded.`);
    }).catch(() => {
      this.notification.error('Failed to generate PDF.');
    });
  }

  bulkDownloadSelected() {
    const ids = this.selection.selected.map(s => s.id);
    if (!ids.length) return;
    this.runBulkDownload(ids, `invoices-selected-${ids.length}.pdf`);
  }

  downloadAllFiltered() {
    if (this.downloadingPdf()) return;
    this.downloadingPdf.set(true);

    this.invoiceService.getAllForPeriod(this.currentQuery()).subscribe({
      next: (items) => {
        if (!items.length) {
          this.notification.warning('No invoices match the current filters.');
          this.downloadingPdf.set(false);
          return;
        }
        const month = this.monthCtrl.value ?? this.currentMonth();
        const year = this.yearCtrl.value ?? this.currentYear();
        this.runBulkDownload(items.map(i => i.id), `invoices-${month}-${year}.pdf`);
      },
      error: () => {
        this.notification.error('Failed to load invoices for download.');
        this.downloadingPdf.set(false);
      },
    });
  }

  openPrint(item: InvoiceListItem) {
    window.open(this.invoiceService.getPrintUrl(item.id), '_blank');
  }

  editInvoice(item: InvoiceListItem) {
    if (item.status !== 'Draft') {
      this.notification.warning('Only draft invoices can be edited.');
      return;
    }
    this.router.navigate(['/billing/invoices', item.id, 'edit']);
  }

  deleteInvoice(item: InvoiceListItem) {
    const statusNote = item.status !== 'Draft' && item.status !== 'Cancelled'
      ? ` This invoice is marked as ${this.statusLabel(item.status)}.`
      : '';
    this.dialog.open(
      ConfirmDialogComponent,
      confirmDialogConfig({
        title: 'Delete Invoice',
        message: `Delete ${item.invoiceNumber}?${statusNote} This action cannot be undone.`,
        confirmLabel: 'Delete',
        icon: 'delete',
        confirmColor: 'warn',
      }),
    ).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.invoiceService.delete(item.id).subscribe({
        next: () => {
          this.notification.success('Invoice deleted.');
          this.loadData();
        },
        error: (err) => this.notification.error(err?.error?.detail ?? err?.error?.message ?? 'Delete failed.'),
      });
    });
  }

  emailInvoice(item: InvoiceListItem) {
    this.dialog.open(
      ConfirmDialogComponent,
      confirmDialogConfig({
        title: 'Email Invoice',
        message: `Send ${item.invoiceNumber} to ${item.clientName}?`,
        confirmLabel: 'Send',
        icon: 'email',
      }),
    ).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.invoiceService.emailInvoice(item.id).subscribe({
        next: () => {
          this.notification.success('Invoice emailed successfully.');
          this.loadData();
        },
        error: () => this.notification.success('Invoice queued for email (demo mode).'),
      });
    });
  }

  clearFilters() {
    this.searchCtrl.setValue('');
    this.statusCtrl.setValue(null);
    this.clientCtrl.setValue(null);
    this.monthCtrl.setValue(this.currentMonth());
    this.yearCtrl.setValue(this.currentYear());
  }

  private runBulkDownload(ids: string[], filename: string) {
    this.dialog.open(
      ConfirmDialogComponent,
      confirmDialogConfig({
        title: 'Bulk Download',
        message: `Download ${ids.length} invoice(s) as a single PDF?`,
        confirmLabel: 'Download',
        icon: 'download',
      }),
    ).afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        this.downloadingPdf.set(false);
        return;
      }
      this.invoicePdfService.downloadMany(ids, filename).then(() => {
        this.notification.success(`${ids.length} invoice(s) downloaded.`);
      }).catch(() => {
        this.notification.error('Bulk download failed.');
      }).finally(() => {
        this.downloadingPdf.set(false);
      });
    });
  }

  private currentQuery() {
    return {
      search: this.searchCtrl.value || undefined,
      status: this.statusCtrl.value ?? undefined,
      clientId: this.clientCtrl.value ?? undefined,
      month: this.monthCtrl.value ?? undefined,
      year: this.yearCtrl.value ?? undefined,
    };
  }

  private currentMonth(): number {
    return new Date().getMonth() + 1;
  }

  private currentYear(): number {
    return new Date().getFullYear();
  }

  private buildYearOptions(): number[] {
    const y = this.currentYear();
    return [y - 1, y, y + 1];
  }
}
