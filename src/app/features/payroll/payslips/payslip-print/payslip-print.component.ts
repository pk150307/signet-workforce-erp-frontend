import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PayslipService } from '../../../../core/services/payslip.service';
import { PayslipPdfService } from '../../../../core/services/payslip-pdf.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PayslipDetail } from '../../../../core/models/payslip.models';
import { PayslipDocumentComponent } from '../payslip-document/payslip-document.component';

import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({
  selector: 'app-payslip-print',
  standalone: true,
  imports: [
    SkeletonLoaderComponent,
    NgIf,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PayslipDocumentComponent,
  ],
  templateUrl: './payslip-print.component.html',
  styleUrl: './payslip-print.component.less',
})
export class PayslipPrintComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly payslipService = inject(PayslipService);
  private readonly payslipPdfService = inject(PayslipPdfService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(true);
  readonly downloading = signal(false);
  readonly payslip = signal<PayslipDetail | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.payslipService.getById(id).subscribe({
      next: (detail) => {
        this.payslip.set(detail);
        this.loading.set(false);
        if (this.route.snapshot.queryParamMap.get('autoprint') === '1') {
          setTimeout(() => window.print(), 400);
        }
        if (this.route.snapshot.queryParamMap.get('pdf') === '1') {
          setTimeout(() => this.downloadPdf(), 500);
        }
      },
      error: () => this.loading.set(false),
    });
  }

  print() {
    window.print();
  }

  async downloadPdf() {
    const ps = this.payslip();
    if (!ps || this.downloading()) return;

    this.downloading.set(true);
    try {
      const host = document.querySelector('app-payslip-document .payslip-document') as HTMLElement | null;
      if (host) {
        await this.payslipPdfService.saveElementAsPdf(
          host,
          `payslip-${ps.employeeCode}-${ps.month}-${ps.year}.pdf`,
        );
      } else {
        await this.payslipPdfService.downloadPayslip(ps);
      }
      this.notification.success('Payslip PDF downloaded.');
    } catch {
      this.notification.error('Failed to generate PDF. Try Print / Save PDF instead.');
    } finally {
      this.downloading.set(false);
    }
  }
}
