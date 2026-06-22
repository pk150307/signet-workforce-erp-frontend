import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { PayslipDetail } from '../models/payslip.models';
import { PayslipDocumentComponent } from '../../features/payroll/payslips/payslip-document/payslip-document.component';
import { PayslipService } from './payslip.service';
import { PdfExportService } from './pdf-export.service';

@Injectable({ providedIn: 'root' })
export class PayslipPdfService {
  private readonly payslipService = inject(PayslipService);
  private readonly pdfExport = inject(PdfExportService);

  downloadById(payslipId: string): Promise<void> {
    return firstValueFrom(this.payslipService.getById(payslipId)).then(payslip =>
      this.downloadPayslip(payslip),
    );
  }

  async downloadPayslip(payslip: PayslipDetail): Promise<void> {
    await this.pdfExport.renderComponentAsPdf({
      component: PayslipDocumentComponent,
      inputs: { ps: payslip },
      selector: '.payslip-document',
      filename: this.filenameFor(payslip),
      width: '800px',
    });
    await firstValueFrom(this.payslipService.markDownloaded(payslip.id)).catch(() => undefined);
  }

  async downloadMany(payslipIds: string[], zipName: string): Promise<void> {
    const payslips: PayslipDetail[] = [];
    for (const id of payslipIds) {
      payslips.push(await firstValueFrom(this.payslipService.getById(id)));
    }

    await this.pdfExport.renderManyComponentsAsSinglePdf(
      payslips.map(ps => ({
        component: PayslipDocumentComponent,
        inputs: { ps },
        selector: '.payslip-document',
        filename: this.filenameFor(ps),
        width: '800px',
      })),
      zipName.endsWith('.pdf') ? zipName : `${zipName}.pdf`,
    );

    await firstValueFrom(this.payslipService.bulkAction({ payslipIds, action: 'download' }));
  }

  saveElementAsPdf(element: HTMLElement, filename: string): Promise<void> {
    return this.pdfExport.saveElementAsPdf(element, filename);
  }

  private filenameFor(payslip: PayslipDetail): string {
    return `payslip-${payslip.employeeCode}-${payslip.month}-${payslip.year}.pdf`;
  }
}
