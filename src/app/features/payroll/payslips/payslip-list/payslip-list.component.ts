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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { PayslipService } from '../../../../core/services/payslip.service';
import { PayslipPdfService } from '../../../../core/services/payslip-pdf.service';
import { ClientsService } from '../../../../core/services/clients.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { confirmDialogConfig } from '../../../../core/utils/dialog.util';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { PaginatedResult } from '../../../../core/models/api.models';
import { PayslipListItem, PayslipStatus } from '../../../../core/models/payslip.models';
import { ClientListItem } from '../../../../core/models/client.models';
import {
  PAYSLIP_MONTHS,
  PAYSLIP_STATUS_OPTIONS,
  getPayslipStatusClass,
} from '../payslip.mock';

interface PayslipStatusAction {
  status: PayslipStatus;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-payslip-list',
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
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule,
    EmptyStateComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './payslip-list.component.html',
  styleUrl: './payslip-list.component.less',
})
export class PayslipListComponent implements OnInit {

  private readonly payslipService = inject(PayslipService);
  private readonly payslipPdfService = inject(PayslipPdfService);
  private readonly clientsService = inject(ClientsService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly downloadingPdf = signal(false);
  readonly data = signal<PaginatedResult<PayslipListItem> | null>(null);
  readonly clients = signal<ClientListItem[]>([]);
  readonly selection = new SelectionModel<PayslipListItem>(true, []);

  readonly months = PAYSLIP_MONTHS;
  readonly years = this.buildYearOptions();
  readonly statusOptions = PAYSLIP_STATUS_OPTIONS;

  readonly searchCtrl = new FormControl('');
  readonly monthCtrl = new FormControl(this.currentMonth());
  readonly yearCtrl = new FormControl(this.currentYear());
  readonly clientCtrl = new FormControl<string | null>(null);
  readonly statusCtrl = new FormControl<PayslipStatus | null>(null);

  readonly displayedColumns = ['select', 'employeeCode', 'employeeName', 'department', 'netSalary', 'status', 'generatedAt', 'actions'];

  page = 1;
  pageSize = 20;

  ngOnInit() {
    this.loadData();

    this.clientsService.getAllForSelect().subscribe({
      next: clients => this.clients.set(clients),
    });

    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.loadData();
    });

    this.monthCtrl.valueChanges.subscribe(() => { this.page = 1; this.loadData(); });
    this.yearCtrl.valueChanges.subscribe(() => { this.page = 1; this.loadData(); });
    this.clientCtrl.valueChanges.subscribe(() => { this.page = 1; this.loadData(); });
    this.statusCtrl.valueChanges.subscribe(() => { this.page = 1; this.loadData(); });
  }

  loadData() {
    this.loading.set(true);
    this.selection.clear();

    this.payslipService.getAll(this.currentQuery()).subscribe({
      next: (result) => {
        this.data.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.data.set({ items: [], page: 1, pageSize: this.pageSize, totalCount: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false });
        this.loading.set(false);
        this.notification.error('Failed to load payslips.');
      },
    });
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  setStatusFilter(status: PayslipStatus | null) {
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

  getStatusClass = getPayslipStatusClass;

  viewPayslip(id: string) {
    this.router.navigate(['/payroll/payslips', id]);
  }

  availableActions(item: PayslipListItem): PayslipStatusAction[] {
    const map: Record<PayslipStatus, PayslipStatusAction[]> = {
      Draft: [
        { status: 'Generated', label: 'Mark Generated', icon: 'task_alt' },
        { status: 'Cancelled', label: 'Cancel', icon: 'cancel' },
      ],
      Generated: [
        { status: 'Sent', label: 'Mark as Sent', icon: 'send' },
        { status: 'Downloaded', label: 'Mark Downloaded', icon: 'download_done' },
        { status: 'Failed', label: 'Mark Failed', icon: 'error_outline' },
        { status: 'Cancelled', label: 'Cancel', icon: 'cancel' },
      ],
      Sent: [
        { status: 'Downloaded', label: 'Mark Downloaded', icon: 'download_done' },
        { status: 'Failed', label: 'Mark Failed', icon: 'error_outline' },
        { status: 'Cancelled', label: 'Cancel', icon: 'cancel' },
      ],
      Failed: [
        { status: 'Generated', label: 'Retry / Regenerate', icon: 'refresh' },
        { status: 'Cancelled', label: 'Cancel', icon: 'cancel' },
      ],
      Downloaded: [],
      Cancelled: [],
    };
    return map[item.status] ?? [];
  }

  canDelete(item: PayslipListItem): boolean {
    return ['Draft', 'Generated', 'Failed', 'Cancelled'].includes(item.status);
  }

  transitionStatus(item: PayslipListItem, action: PayslipStatusAction) {
    this.payslipService.updateStatus(item.id, { status: action.status }).subscribe({
      next: () => {
        this.notification.success(`Payslip marked as ${action.status}.`);
        this.loadData();
      },
      error: (err) => this.notification.error(err?.error?.detail ?? err?.error?.message ?? 'Status update failed.'),
    });
  }

  deletePayslip(item: PayslipListItem) {
    if (!this.canDelete(item)) {
      this.notification.warning('Cancel sent or downloaded payslips before deleting.');
      return;
    }

    this.dialog.open(
      ConfirmDialogComponent,
      confirmDialogConfig({
        title: 'Delete Payslip',
        message: `Delete payslip for ${item.employeeName}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        icon: 'delete',
        confirmColor: 'warn',
      }),
    ).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.payslipService.delete(item.id).subscribe({
        next: () => {
          this.notification.success('Payslip deleted.');
          this.loadData();
        },
        error: (err) => this.notification.error(err?.error?.detail ?? err?.error?.message ?? 'Delete failed.'),
      });
    });
  }

  downloadPayslip(item: PayslipListItem) {
    if (this.downloadingPdf()) return;

    this.downloadingPdf.set(true);
    this.payslipPdfService.downloadById(item.id).then(() => {
      this.notification.success(`${item.employeeCode} payslip downloaded.`);
      this.loadData();
    }).catch(() => {
      this.notification.warning('PDF download unavailable. Opening print view.');
      window.open(this.payslipService.getPrintUrl(item.id), '_blank');
    }).finally(() => {
      this.downloadingPdf.set(false);
    });
  }

  emailPayslip(item: PayslipListItem) {
    this.payslipService.emailPayslip(item.id).subscribe({
      next: () => {
        this.notification.success(`Payslip emailed to ${item.employeeName}.`);
        this.loadData();
      },
      error: (err) => this.notification.error(err?.error?.detail ?? 'Failed to email payslip.'),
    });
  }

  bulkDownloadSelected() {
    const ids = this.selection.selected.map(s => s.id);
    if (!ids.length) return;
    this.runBulkDownload(ids, `payslips-selected-${ids.length}.pdf`);
  }

  downloadAllFiltered() {
    if (this.downloadingPdf()) return;

    this.downloadingPdf.set(true);
    this.payslipService.getAllForPeriod(this.currentQuery()).subscribe({
      next: (items) => {
        if (!items.length) {
          this.notification.warning('No payslips match the current filters.');
          this.downloadingPdf.set(false);
          return;
        }
        const month = this.monthCtrl.value ?? this.currentMonth();
        const year = this.yearCtrl.value ?? this.currentYear();
        this.runBulkDownload(items.map(i => i.id), `payslips-${month}-${year}.pdf`);
      },
      error: () => {
        this.notification.error('Failed to load payslips for download.');
        this.downloadingPdf.set(false);
      },
    });
  }

  bulkEmail() {
    const ids = this.selection.selected.map(s => s.id);
    if (!ids.length) return;

    this.dialog.open(
      ConfirmDialogComponent,
      confirmDialogConfig({
        title: 'Bulk Email',
        message: `Email ${ids.length} payslip(s) to employees?`,
        confirmLabel: 'Send',
        icon: 'email',
      }),
    ).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.payslipService.bulkAction({ payslipIds: ids, action: 'email' }).subscribe({
        next: (res: unknown) => {
          const data = (res as { data?: { processed?: number } })?.data ?? res as { processed?: number };
          this.notification.success(`${data.processed ?? ids.length} payslip(s) emailed.`);
          this.loadData();
        },
        error: () => this.notification.error('Bulk email failed.'),
      });
    });
  }

  clearFilters() {
    this.searchCtrl.setValue('');
    this.clientCtrl.setValue(null);
    this.statusCtrl.setValue(null);
    this.monthCtrl.setValue(this.currentMonth());
    this.yearCtrl.setValue(this.currentYear());
  }

  private runBulkDownload(ids: string[], filename: string) {
    this.dialog.open(
      ConfirmDialogComponent,
      confirmDialogConfig({
        title: 'Bulk Download',
        message: `Download ${ids.length} payslip(s) as a single PDF?`,
        confirmLabel: 'Download',
        icon: 'download',
      }),
    ).afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        this.downloadingPdf.set(false);
        return;
      }
      this.payslipPdfService.downloadMany(ids, filename).then(() => {
        this.notification.success(`${ids.length} payslip(s) downloaded.`);
        this.loadData();
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
      month: this.monthCtrl.value ?? undefined,
      year: this.yearCtrl.value ?? undefined,
      clientId: this.clientCtrl.value ?? undefined,
      status: this.statusCtrl.value ?? undefined,
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
