import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { EmployeeAdvancesService } from '../../../../core/services/employee-advances.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { confirmDialogConfig, featureDialogConfig } from '../../../../core/utils/dialog.util';
import {
  EmployeeAdvanceDetail,
  EmployeeAdvanceEntry,
} from '../../../../core/models/employee-advances.models';
import {
  canEditEmployeeAdvance,
  employeeAdvanceMonthLabel,
  employeeAdvanceStatusLabel,
} from '../employee-advances.constants';
import {
  EmployeeAdvancesPaymentsDialogComponent,
  EmployeeAdvancesPaymentsDialogResult,
} from '../employee-advances-payments-dialog/employee-advances-payments-dialog.component';
import {
  EmployeeAdvancesReopenDialogComponent,
  EmployeeAdvancesReopenDialogResult,
} from '../employee-advances-reopen-dialog/employee-advances-reopen-dialog.component';
import { SortDir, compareBy, sortIconName, toggleSortState } from '../../../../core/utils/sort.util';
import {
  ExportColumnsDialogResult,
  openExportColumnsDialog,
} from '../../../../shared/components/export-columns-dialog/export-columns-dialog.component';
import { EMPLOYEE_ADVANCE_EXPORT_COLUMNS } from '../../../../core/constants/export-columns.constants';

@Component({
  selector: 'app-employee-advances-detail',
  templateUrl: './employee-advances-detail.component.html',
  styleUrl: './employee-advances-detail.component.less',
})
export class EmployeeAdvancesDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly advancesService = inject(EmployeeAdvancesService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly actionBusy = signal(false);
  readonly exporting = signal(false);
  readonly register = signal<EmployeeAdvanceDetail | null>(null);

  readonly statusLabel = employeeAdvanceStatusLabel;
  readonly monthLabel = employeeAdvanceMonthLabel;
  readonly canEdit = canEditEmployeeAdvance;
  sortBy = 'softCode';
  sortDir: SortDir = 'asc';

  toggleSort(active: string) {
    const next = toggleSortState(this.sortBy, this.sortDir, active);
    this.sortBy = next.sortBy;
    this.sortDir = next.sortDir;
  }

  sortIcon(active: string): string {
    return sortIconName(this.sortBy, this.sortDir, active);
  }

  sortedEmployees(rows: EmployeeAdvanceEntry[] | null | undefined): EmployeeAdvanceEntry[] {
    const key = this.sortBy;
    return [...(rows ?? [])].sort((a, b) => compareBy(a, b, (row) => (
      key === 'employeeCode' ? row.employeeCode : (row.softCode ?? '')
    ), this.sortDir));
  }

  ngOnInit() {
    this.loadRegister(this.route.snapshot.params['id']);
  }

  loadRegister(id: string) {
    this.loading.set(true);
    this.advancesService.getById(id).subscribe({
      next: (detail) => {
        if (!detail?.id) {
          this.notFound.set(true);
          this.loading.set(false);
          return;
        }
        this.register.set(detail);
        this.breadcrumbService.updateLast(
          `${detail.clientName} · ${employeeAdvanceMonthLabel(detail.month)} ${detail.year}`,
        );
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
        this.notification.error('Failed to load advance register.');
      },
    });
  }

  editEntry(row: EmployeeAdvanceEntry) {
    const reg = this.register();
    if (!reg) return;

    this.dialog.open(
      EmployeeAdvancesPaymentsDialogComponent,
      featureDialogConfig({
        width: '640px',
        data: {
          registerId: reg.id,
          month: reg.month,
          year: reg.year,
          row,
          canEdit: this.canEdit(reg.status),
        },
      }),
    ).afterClosed().subscribe((result?: EmployeeAdvancesPaymentsDialogResult) => {
      if (result) this.register.set(result);
    });
  }

  refresh() {
    const reg = this.register();
    if (!reg || !this.canEdit(reg.status) || this.actionBusy()) return;

    this.dialog.open(
      ConfirmDialogComponent,
      confirmDialogConfig({
        title: 'Refresh from salary register?',
        message:
          'Re-loads employees and salary net pay snapshots. Existing advance amounts are kept.',
        confirmLabel: 'Refresh',
        icon: 'refresh',
      }),
    ).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.actionBusy.set(true);
      this.advancesService.refresh(reg.id).subscribe({
        next: (detail) => {
          this.register.set(detail);
          this.actionBusy.set(false);
          this.notification.success('Advance register refreshed.');
        },
        error: (err) => {
          this.actionBusy.set(false);
          this.notification.error(
            err?.error?.detail ?? err?.error?.message ?? 'Refresh failed.',
          );
        },
      });
    });
  }

  finalize() {
    const reg = this.register();
    if (!reg || !this.canEdit(reg.status) || this.actionBusy()) return;

    this.dialog.open(
      ConfirmDialogComponent,
      confirmDialogConfig({
        title: 'Finalize advance register?',
        message: 'Locks advance amounts for payment. You can reopen later if needed.',
        confirmLabel: 'Finalize',
        icon: 'lock',
      }),
    ).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.actionBusy.set(true);
      this.advancesService.finalize(reg.id).subscribe({
        next: (detail) => {
          this.register.set(detail);
          this.actionBusy.set(false);
          this.notification.success('Advance register finalized.');
        },
        error: (err) => {
          this.actionBusy.set(false);
          this.notification.error(
            err?.error?.detail ?? err?.error?.message ?? 'Finalize failed.',
          );
        },
      });
    });
  }

  reopen() {
    const reg = this.register();
    if (!reg || reg.status !== 'finalized' || this.actionBusy()) return;

    this.dialog.open(
      EmployeeAdvancesReopenDialogComponent,
      featureDialogConfig({ width: '480px' }),
    ).afterClosed().subscribe((result?: EmployeeAdvancesReopenDialogResult) => {
      if (!result) return;
      this.actionBusy.set(true);
      this.advancesService.reopen(reg.id, { reason: result.reason || undefined }).subscribe({
        next: (detail) => {
          this.register.set(detail);
          this.actionBusy.set(false);
          this.notification.success('Advance register reopened.');
        },
        error: (err) => {
          this.actionBusy.set(false);
          this.notification.error(
            err?.error?.detail ?? err?.error?.message ?? 'Reopen failed.',
          );
        },
      });
    });
  }

  exportExcel() {
    this.openExportDialog('excel');
  }

  exportPdf() {
    this.openExportDialog('pdf');
  }

  private openExportDialog(format: 'excel' | 'pdf') {
    const reg = this.register();
    if (!reg || this.exporting()) return;

    openExportColumnsDialog(this.dialog, {
      format,
      columns: EMPLOYEE_ADVANCE_EXPORT_COLUMNS,
    }).subscribe((result: ExportColumnsDialogResult | null) => {
      if (!result?.columns?.length) return;
      this.exporting.set(true);
      const request = format === 'pdf'
        ? this.advancesService.exportPdf(reg.id, result.columns)
        : this.advancesService.exportExcel(reg.id, result.columns);
      request.subscribe({
        next: (blob) => {
          this.saveBlob(
            blob,
            `employee-advances-${reg.clientCode || reg.clientId}-${reg.year}-${String(reg.month).padStart(2, '0')}.${format === 'pdf' ? 'pdf' : 'xlsx'}`,
          );
          this.exporting.set(false);
          this.notification.success(format === 'pdf' ? 'PDF export downloaded.' : 'Excel export downloaded.');
        },
        error: () => {
          this.exporting.set(false);
          this.notification.error('Export failed.');
        },
      });
    });
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
