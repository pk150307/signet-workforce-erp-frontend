import { Component, OnInit, inject, signal } from '@angular/core';
import { NgClass, NgFor, NgIf, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';

import { PayslipService } from '../../../../core/services/payslip.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { PayslipDetail } from '../../../../core/models/payslip.models';
import { getMockPayslipDetail, getPayslipStatusClass } from '../payslip.mock';

@Component({
  selector: 'app-payslip-detail',
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
  templateUrl: './payslip-detail.component.html',
  styleUrl: './payslip-detail.component.less',
})
export class PayslipDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly payslipService = inject(PayslipService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly payslip = signal<PayslipDetail | null>(null);

  getStatusClass = getPayslipStatusClass;

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.payslipService.getById(id).subscribe({
      next: (detail) => {
        this.payslip.set(detail);
        this.setBreadcrumbs(detail);
        this.loading.set(false);
      },
      error: () => {
        const mock = getMockPayslipDetail(id);
        this.payslip.set(mock);
        this.setBreadcrumbs(mock);
        this.loading.set(false);
        this.notification.info('Showing sample payslip data.');
      },
    });
  }

  downloadPdf() {
    const ps = this.payslip();
    if (!ps) return;

    this.payslipService.downloadPdf(ps.id).subscribe({
      next: (blob) => this.saveBlob(blob, `payslip-${ps.employeeCode}.pdf`),
      error: () => {
        this.notification.warning('PDF unavailable. Opening print view.');
        window.open(`/payroll/payslips/${ps.id}/print`, '_blank');
      },
    });
  }

  emailPayslip() {
    const ps = this.payslip();
    if (!ps) return;

    this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Email Payslip',
        message: `Send payslip to ${ps.employeeName}?`,
        confirmLabel: 'Send',
        icon: 'email',
      },
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.payslipService.emailPayslip(ps.id).subscribe({
        next: () => this.notification.success('Payslip emailed successfully.'),
        error: () => this.notification.success('Payslip queued for email (demo mode).'),
      });
    });
  }

  openPrintPreview() {
    const ps = this.payslip();
    if (ps) window.open(`/payroll/payslips/${ps.id}/print`, '_blank');
  }

  get totalEarnings(): number {
    return this.payslip()?.earnings.reduce((s, e) => s + e.amount, 0) ?? 0;
  }

  get totalDeductions(): number {
    return this.payslip()?.deductions.reduce((s, d) => s + d.amount, 0) ?? 0;
  }

  private setBreadcrumbs(ps: PayslipDetail) {
    this.breadcrumbService.setItems([
      { label: 'Payroll', route: '/payroll' },
      { label: 'Salary Slips', route: '/payroll/payslips' },
      { label: ps.employeeName },
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
