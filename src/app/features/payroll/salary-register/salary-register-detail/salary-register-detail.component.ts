import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { SalaryRegisterService } from '../../../../core/services/salary-register.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { confirmDialogConfig, featureDialogConfig } from '../../../../core/utils/dialog.util';
import {
  SalaryRegisterDetail,
  SalaryRegisterEmployeeRow,
} from '../../../../core/models/salary-register.models';
import {
  canEditSalaryRegister,
  salaryRegisterMonthLabel,
  salaryRegisterStatusLabel,
} from '../salary-register.constants';
import {
  SalaryRegisterEditRowDialogComponent,
  SalaryRegisterEditRowDialogResult,
} from '../salary-register-edit-row-dialog/salary-register-edit-row-dialog.component';
import {
  SalaryRegisterReopenDialogComponent,
  SalaryRegisterReopenDialogResult,
} from '../salary-register-reopen-dialog/salary-register-reopen-dialog.component';

@Component({
  selector: 'app-salary-register-detail',
  templateUrl: './salary-register-detail.component.html',
  styleUrl: './salary-register-detail.component.less',
})
export class SalaryRegisterDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly salaryRegisterService = inject(SalaryRegisterService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly actionBusy = signal(false);
  readonly exporting = signal(false);
  readonly register = signal<SalaryRegisterDetail | null>(null);

  readonly statusLabel = salaryRegisterStatusLabel;
  readonly monthLabel = salaryRegisterMonthLabel;
  readonly canEdit = canEditSalaryRegister;

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.loadRegister(id);
  }

  loadRegister(id: string) {
    this.loading.set(true);
    this.salaryRegisterService.getById(id).subscribe({
      next: (detail) => {
        if (!detail?.id) {
          this.notFound.set(true);
          this.loading.set(false);
          return;
        }
        this.register.set(detail);
        this.breadcrumbService.updateLast(
          `${detail.clientName} · ${salaryRegisterMonthLabel(detail.month)} ${detail.year}`,
        );
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
        this.notification.error('Failed to load salary register.');
      },
    });
  }

  validationTooltip(row: SalaryRegisterEmployeeRow): string {
    if (!row.validationMessages?.length) {
      return row.validationStatus === 'ok' ? 'OK' : row.validationStatus;
    }
    return row.validationMessages.join('\n');
  }

  editRow(row: SalaryRegisterEmployeeRow) {
    const reg = this.register();
    if (!reg || !this.canEdit(reg.status)) return;

    this.dialog.open(
      SalaryRegisterEditRowDialogComponent,
      featureDialogConfig({
        width: '480px',
        data: { row },
      }),
    ).afterClosed().subscribe((result?: SalaryRegisterEditRowDialogResult) => {
      if (!result) return;
      this.actionBusy.set(true);
      this.salaryRegisterService.updateEmployeeRow(reg.id, row.id, result).subscribe({
        next: (detail) => {
          this.register.set(detail);
          this.actionBusy.set(false);
          this.notification.success('Employee row updated.');
        },
        error: (err) => {
          this.actionBusy.set(false);
          this.notification.error(
            err?.error?.detail ?? err?.error?.message ?? 'Failed to update employee row.',
          );
        },
      });
    });
  }

  recalculate() {
    const reg = this.register();
    if (!reg || !this.canEdit(reg.status) || this.actionBusy()) return;

    this.dialog.open(
      ConfirmDialogComponent,
      confirmDialogConfig({
        title: 'Recalculate Register',
        message: 'Recalculate all employee rows from attendance and salary components?',
        confirmLabel: 'Recalculate',
        icon: 'refresh',
      }),
    ).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.actionBusy.set(true);
      this.salaryRegisterService.recalculate(reg.id).subscribe({
        next: (detail) => {
          this.register.set(detail);
          this.actionBusy.set(false);
          this.notification.success('Salary register recalculated.');
        },
        error: (err) => {
          this.actionBusy.set(false);
          this.notification.error(
            err?.error?.detail ?? err?.error?.message ?? 'Recalculate failed.',
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
        title: 'Finalize Register',
        message: 'Finalize this salary register? Editable fields will be locked until reopened.',
        confirmLabel: 'Finalize',
        icon: 'lock',
      }),
    ).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.actionBusy.set(true);
      this.salaryRegisterService.finalize(reg.id).subscribe({
        next: (detail) => {
          this.register.set(detail);
          this.actionBusy.set(false);
          this.notification.success('Salary register finalized.');
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
      SalaryRegisterReopenDialogComponent,
      featureDialogConfig({ width: '440px' }),
    ).afterClosed().subscribe((result?: SalaryRegisterReopenDialogResult | null) => {
      if (result == null) return;
      this.actionBusy.set(true);
      this.salaryRegisterService.reopen(reg.id, {
        reason: result.reason || undefined,
      }).subscribe({
        next: (detail) => {
          this.register.set(detail);
          this.actionBusy.set(false);
          this.notification.success('Salary register reopened.');
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
    const reg = this.register();
    if (!reg || this.exporting()) return;

    this.exporting.set(true);
    this.salaryRegisterService.exportExcel(reg.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const code = reg.clientCode || reg.clientId;
        const month = String(reg.month).padStart(2, '0');
        a.download = `salary-register-${code}-${reg.year}-${month}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        this.exporting.set(false);
        this.notification.success('Excel export downloaded.');
      },
      error: () => {
        this.exporting.set(false);
        this.notification.error('Export failed.');
      },
    });
  }

  exportPdf() {
    const reg = this.register();
    if (!reg || this.exporting()) return;

    this.exporting.set(true);
    this.salaryRegisterService.exportPdf(reg.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const code = reg.clientCode || reg.clientId;
        const month = String(reg.month).padStart(2, '0');
        a.download = `salary-register-${code}-${reg.year}-${month}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.exporting.set(false);
        this.notification.success('PDF export downloaded.');
      },
      error: () => {
        this.exporting.set(false);
        this.notification.error('Export failed.');
      },
    });
  }
}
