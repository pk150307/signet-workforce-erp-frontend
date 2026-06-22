import { Component, OnInit, inject, signal } from '@angular/core';
import { NgClass, NgFor, NgIf, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';

import { PayslipService } from '../../../../core/services/payslip.service';
import { PayslipPdfService } from '../../../../core/services/payslip-pdf.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { confirmDialogConfig } from '../../../../core/utils/dialog.util';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ApiDatePipe } from '../../../../shared/pipes/api-date.pipe';
import { PayslipDetail, PayslipStatus } from '../../../../core/models/payslip.models';
import { PAYSLIP_MONTHS, getPayslipStatusClass } from '../payslip.mock';
import { PayslipDocumentComponent } from '../payslip-document/payslip-document.component';

interface StatusAction {
  status: PayslipStatus;
  label: string;
  icon: string;
  color?: 'primary' | 'warn';
}

@Component({
  selector: 'app-payslip-detail',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DecimalPipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatMenuModule,
    SkeletonLoaderComponent,
    ApiDatePipe,
    PayslipDocumentComponent,
  ],
  templateUrl: './payslip-detail.component.html',
  styleUrl: './payslip-detail.component.less',
})
export class PayslipDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly payslipService = inject(PayslipService);
  private readonly payslipPdfService = inject(PayslipPdfService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly downloadingPdf = signal(false);
  readonly payslip = signal<PayslipDetail | null>(null);

  getStatusClass = getPayslipStatusClass;

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.loadPayslip(id);
  }

  loadPayslip(id: string) {
    this.loading.set(true);
    this.payslipService.getById(id).subscribe({
      next: (detail) => {
        if (!detail.employeeName && !detail.employeeCode) {
          this.notFound.set(true);
          this.loading.set(false);
          return;
        }
        this.payslip.set(detail);
        this.setBreadcrumbs(detail);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  availableActions(ps: PayslipDetail): StatusAction[] {
    const map: Record<PayslipStatus, StatusAction[]> = {
      Draft: [
        { status: 'Generated', label: 'Mark Generated', icon: 'task_alt', color: 'primary' },
        { status: 'Cancelled', label: 'Cancel', icon: 'cancel', color: 'warn' },
      ],
      Generated: [
        { status: 'Sent', label: 'Mark as Sent', icon: 'send' },
        { status: 'Downloaded', label: 'Mark Downloaded', icon: 'download_done', color: 'primary' },
        { status: 'Failed', label: 'Mark Failed', icon: 'error_outline', color: 'warn' },
        { status: 'Cancelled', label: 'Cancel', icon: 'cancel', color: 'warn' },
      ],
      Sent: [
        { status: 'Downloaded', label: 'Mark Downloaded', icon: 'download_done', color: 'primary' },
        { status: 'Failed', label: 'Mark Failed', icon: 'error_outline', color: 'warn' },
        { status: 'Cancelled', label: 'Cancel', icon: 'cancel', color: 'warn' },
      ],
      Failed: [
        { status: 'Generated', label: 'Retry / Regenerate', icon: 'refresh', color: 'primary' },
        { status: 'Cancelled', label: 'Cancel', icon: 'cancel', color: 'warn' },
      ],
      Downloaded: [],
      Cancelled: [],
    };
    return map[ps.status] ?? [];
  }

  canDelete(ps: PayslipDetail): boolean {
    return ['Draft', 'Generated', 'Failed', 'Cancelled'].includes(ps.status);
  }

  transitionStatus(action: StatusAction) {
    const ps = this.payslip();
    if (!ps) return;

    this.payslipService.updateStatus(ps.id, { status: action.status }).subscribe({
      next: (updated) => {
        this.payslip.set(updated);
        this.notification.success(`Payslip marked as ${action.status}.`);
      },
      error: (err) => this.notification.error(err?.error?.detail ?? err?.error?.message ?? 'Status update failed.'),
    });
  }

  deletePayslip() {
    const ps = this.payslip();
    if (!ps) return;

    this.dialog.open(
      ConfirmDialogComponent,
      confirmDialogConfig({
        title: 'Delete Payslip',
        message: `Delete payslip for ${ps.employeeName}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        icon: 'delete',
        confirmColor: 'warn',
      }),
    ).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.payslipService.delete(ps.id).subscribe({
        next: () => {
          this.notification.success('Payslip deleted.');
          this.router.navigate(['/payroll/payslips']);
        },
        error: (err) => this.notification.error(err?.error?.detail ?? err?.error?.message ?? 'Delete failed.'),
      });
    });
  }

  monthLabel(ps: PayslipDetail): string {
    return PAYSLIP_MONTHS.find(m => m.value === ps.month)?.label ?? String(ps.month);
  }

  totalDeductionsAmount(ps: PayslipDetail): number {
    return ps.deductions.reduce((sum, item) => sum + item.amount, 0);
  }

  downloadPdf() {
    const ps = this.payslip();
    if (!ps || this.downloadingPdf()) return;

    this.downloadingPdf.set(true);
    this.payslipPdfService.downloadPayslip(ps).then(() => {
      this.notification.success('Payslip PDF downloaded.');
      this.loadPayslip(ps.id);
    }).catch(() => {
      this.notification.error('Failed to generate PDF. Opening print view.');
      window.open(this.payslipService.getPrintUrl(ps.id), '_blank');
    }).finally(() => {
      this.downloadingPdf.set(false);
    });
  }

  emailPayslip() {
    const ps = this.payslip();
    if (!ps) return;

    this.dialog.open(
      ConfirmDialogComponent,
      confirmDialogConfig({
        title: 'Email Payslip',
        message: `Send payslip to ${ps.employeeName}?`,
        confirmLabel: 'Send',
        icon: 'email',
      }),
    ).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.payslipService.emailPayslip(ps.id).subscribe({
        next: () => {
          this.notification.success('Payslip emailed successfully.');
          this.loadPayslip(ps.id);
        },
        error: () => this.notification.error('Failed to email payslip.'),
      });
    });
  }

  openPrintPreview() {
    const ps = this.payslip();
    if (ps) window.open(this.payslipService.getPrintUrl(ps.id), '_blank');
  }

  private setBreadcrumbs(ps: PayslipDetail) {
    this.breadcrumbService.updateLast(ps.employeeName);
  }
}
