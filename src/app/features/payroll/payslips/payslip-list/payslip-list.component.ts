import { Component, OnInit, computed, inject, signal, DestroyRef } from '@angular/core';
import { NgClass, NgFor, NgIf, DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { PayslipService } from '../../../../core/services/payslip.service';
import { PayslipPdfService } from '../../../../core/services/payslip-pdf.service';
import { PayrollFilterService } from '../../../../core/services/payroll-filter.service';
import { ClientsService } from '../../../../core/services/clients.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { confirmDialogConfig } from '../../../../core/utils/dialog.util';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { CursorPageParams, CursorPaginatedResult } from '../../../../core/models/api.models';
import {
  CursorPaginationState,
  emptyCursorPage,
  isInvalidCursorError,
  resolvePaginationNavigate,
} from '../../../../core/utils/cursor-pagination.util';
import { PaginationNavigateEvent } from '../../../../library/components/pagination/pagination.component';
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
    templateUrl: './payslip-list.component.html',
  styleUrl: './payslip-list.component.less',
})
export class PayslipListComponent implements OnInit {

  private readonly payslipService = inject(PayslipService);
  private readonly payslipPdfService = inject(PayslipPdfService);
  private readonly payrollFilter = inject(PayrollFilterService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly clientsService = inject(ClientsService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  readonly router = inject(Router);

  readonly loading = signal(true);
  readonly downloadingPdf = signal(false);
  readonly data = signal<CursorPaginatedResult<PayslipListItem> | null>(null);
  readonly pager = new CursorPaginationState();
  readonly clients = signal<ClientListItem[]>([]);
  readonly selection = new SelectionModel<PayslipListItem>(true, []);

  readonly months = PAYSLIP_MONTHS;
  readonly years = this.buildYearOptions();
  readonly statusOptions = PAYSLIP_STATUS_OPTIONS;

  readonly monthOptions = computed(() =>
    this.months.map(m => ({ key: String(m.value), value: m.label })),
  );

  readonly yearOptions = computed(() =>
    this.years.map(y => ({ key: String(y), value: String(y) })),
  );

  readonly clientOptions = computed(() => [
    { key: '', value: 'All Clients' },
    ...this.clients().map(c => ({ key: String(c.id), value: c.companyName })),
  ]);

  readonly searchCtrl = new FormControl('');
  readonly monthCtrl = new FormControl<number | null>(this.payrollFilter.month());
  readonly yearCtrl = new FormControl<number | null>(this.payrollFilter.year());
  readonly clientCtrl = new FormControl<string | null>(this.payrollFilter.clientId());
  readonly statusCtrl = new FormControl<PayslipStatus | null>(null);

  readonly displayedColumns = ['select', 'employeeCode', 'employeeName', 'client', 'department', 'netSalary', 'status', 'generatedAt', 'actions'];


  ngOnInit() {
    this.payrollFilter.bindControls(
      { month: this.monthCtrl, year: this.yearCtrl, clientId: this.clientCtrl },
      this.destroyRef,
      () => { this.pager.reset(); this.loadData(this.pager.firstPageParams()); },
    );

    this.loadData();

    this.clientsService.getAllForSelect().subscribe({
      next: clients => this.clients.set(clients),
    });

    this.searchCtrl.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.pager.reset();
      this.loadData(this.pager.firstPageParams());
    });

    this.statusCtrl.valueChanges.subscribe(() => { this.pager.reset(); this.loadData(this.pager.firstPageParams()); });
  }

  loadData(params?: CursorPageParams) {
    this.loading.set(true);
    this.selection.clear();
    const pageParams = params ?? this.pager.firstPageParams();

    this.payslipService.getAll({ ...this.currentQuery(), ...pageParams }).subscribe({
      next: (result) => {
        this.data.set(result);
        this.pager.apply(result.pagination);
        this.loading.set(false);
      },
      error: (err) => {
        if (isInvalidCursorError(err)) {
          this.pager.reset();
          this.loadData(this.pager.firstPageParams());
          return;
        }
        this.data.set(emptyCursorPage(this.pager.pageSize));
        this.pager.reset();
        this.loading.set(false);
        this.notification.error('Failed to load payslips.');
      },
    });
  }

  onPaginationNavigate(event: PaginationNavigateEvent) {
    const p = resolvePaginationNavigate(this.pager, event);
    if (p) this.loadData(p);
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

  onRowSelect(row: PayslipListItem, event: { checked: boolean }) {
    if (event.checked) {
      this.selection.select(row);
    } else {
      this.selection.deselect(row);
    }
  }

  getStatusClass = getPayslipStatusClass;

  clientLabel(row: PayslipListItem): string {
    if (row.clientName?.trim()) return row.clientName.trim();
    if (row.clientId) {
      const match = this.clients().find(c => String(c.id) === String(row.clientId));
      if (match?.companyName) return match.companyName;
    }
    const filterClientId = this.clientCtrl.value;
    if (filterClientId) {
      const match = this.clients().find(c => String(c.id) === String(filterClientId));
      if (match?.companyName) return match.companyName;
    }
    return '—';
  }

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
        const month = this.monthCtrl.value ?? this.payrollFilter.month();
        const year = this.yearCtrl.value ?? this.payrollFilter.year();
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
    this.statusCtrl.setValue(null);
    this.payrollFilter.resetAll();
    this.monthCtrl.setValue(this.payrollFilter.month(), { emitEvent: false });
    this.yearCtrl.setValue(this.payrollFilter.year(), { emitEvent: false });
    this.clientCtrl.setValue(this.payrollFilter.clientId(), { emitEvent: false });
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
      clientId: this.clientCtrl.value || undefined,
      status: this.statusCtrl.value ?? undefined,
    };
  }

  private currentMonth(): number {
    return this.payrollFilter.month();
  }

  private currentYear(): number {
    return this.payrollFilter.year();
  }

  private buildYearOptions(): number[] {
    const y = this.currentYear();
    return [y - 1, y, y + 1];
  }
}
