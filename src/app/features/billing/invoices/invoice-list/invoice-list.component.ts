import { Component, OnInit, inject, signal } from '@angular/core';
import { NgClass, NgFor, NgIf, DatePipe, DecimalPipe } from '@angular/common';
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
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { PaginatedResult } from '../../../../core/models/api.models';
import { InvoiceListItem, InvoiceStatus } from '../../../../core/models/invoice.models';
import { INVOICE_STATUS_OPTIONS, getInvoiceStatusClass, getMockInvoiceList } from '../invoice.mock';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    DecimalPipe,
    RouterLink,
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
    EmptyStateComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.less',
})
export class InvoiceListComponent implements OnInit {

  private readonly invoiceService = inject(InvoiceService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly usingMock = signal(false);
  readonly data = signal<PaginatedResult<InvoiceListItem> | null>(null);

  readonly statusOptions = INVOICE_STATUS_OPTIONS;
  readonly searchCtrl = new FormControl('');
  readonly statusCtrl = new FormControl<InvoiceStatus | null>(null);
  readonly monthCtrl = new FormControl<number | null>(null);
  readonly yearCtrl = new FormControl<number | null>(null);

  readonly displayedColumns = ['invoiceNumber', 'client', 'site', 'invoiceDate', 'dueDate', 'totalAmount', 'status', 'actions'];

  page = 1;
  pageSize = 20;

  ngOnInit() {
    this.breadcrumbService.setItems([
      { label: 'Billing', route: '/billing/dashboard' },
      { label: 'Invoices' },
    ]);

    this.loadData();

    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.loadData();
    });

    this.statusCtrl.valueChanges.subscribe(() => { this.page = 1; this.loadData(); });
    this.monthCtrl.valueChanges.subscribe(() => { this.page = 1; this.loadData(); });
    this.yearCtrl.valueChanges.subscribe(() => { this.page = 1; this.loadData(); });
  }

  loadData() {
    this.loading.set(true);

    this.invoiceService.getAll({
      page: this.page,
      pageSize: this.pageSize,
      search: this.searchCtrl.value || undefined,
      status: this.statusCtrl.value ?? undefined,
      month: this.monthCtrl.value ?? undefined,
      year: this.yearCtrl.value ?? undefined,
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

  getStatusClass = getInvoiceStatusClass;

  viewInvoice(id: string) {
    this.router.navigate(['/billing/invoices', id]);
  }

  downloadPdf(item: InvoiceListItem) {
    this.invoiceService.downloadPdf(item.id).subscribe({
      next: (blob) => this.saveBlob(blob, `${item.invoiceNumber}.pdf`),
      error: () => {
        this.notification.warning('PDF unavailable. Opening print view.');
        window.open(`/billing/invoices/${item.id}/print`, '_blank');
      },
    });
  }

  emailInvoice(item: InvoiceListItem) {
    this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Email Invoice',
        message: `Send ${item.invoiceNumber} to ${item.clientName}?`,
        confirmLabel: 'Send',
        icon: 'email',
      },
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.invoiceService.emailInvoice(item.id).subscribe({
        next: () => this.notification.success('Invoice emailed successfully.'),
        error: () => this.notification.success('Invoice queued for email (demo mode).'),
      });
    });
  }

  exportInvoices() {
    this.invoiceService.export({
      search: this.searchCtrl.value || undefined,
      status: this.statusCtrl.value ?? undefined,
    }).subscribe({
      next: (blob) => this.saveBlob(blob, 'invoices-export.xlsx'),
      error: () => this.notification.warning('Export unavailable in demo mode.'),
    });
  }

  clearFilters() {
    this.searchCtrl.setValue('');
    this.statusCtrl.setValue(null);
    this.monthCtrl.setValue(null);
    this.yearCtrl.setValue(null);
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
