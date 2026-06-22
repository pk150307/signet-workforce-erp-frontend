import { Component, Input } from '@angular/core';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { InvoiceDetail } from '../../../../core/models/invoice.models';
import { mapInvoiceStatusLabel } from '../../../../core/utils/api-response.util';
import { ApiDatePipe } from '../../../../shared/pipes/api-date.pipe';

@Component({
  selector: 'app-invoice-document',
  standalone: true,
  imports: [NgIf, NgFor, DecimalPipe, ApiDatePipe],
  templateUrl: './invoice-document.component.html',
  styleUrl: './invoice-document.component.less',
})
export class InvoiceDocumentComponent {
  @Input({ required: true }) inv!: InvoiceDetail;

  readonly statusLabel = mapInvoiceStatusLabel;

  companyAddress(): string {
    const c = this.inv?.company;
    if (!c?.address && !c?.city && !c?.state) return '—';
    return [c.address, [c.city, c.state, c.pinCode].filter(Boolean).join(', ')].filter(Boolean).join('\n');
  }
}
