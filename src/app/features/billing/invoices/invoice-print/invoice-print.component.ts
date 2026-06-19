import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { InvoiceDetail } from '../../../../core/models/invoice.models';
import { getMockInvoiceDetail } from '../invoice.mock';

@Component({
  selector: 'app-invoice-print',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, DecimalPipe, MatButtonModule, MatIconModule],
  templateUrl: './invoice-print.component.html',
  styleUrl: './invoice-print.component.less',
})
export class InvoicePrintComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly invoiceService = inject(InvoiceService);

  readonly invoice = signal<InvoiceDetail | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.invoiceService.getById(id).subscribe({
      next: (detail) => this.invoice.set(detail),
      error: () => this.invoice.set(getMockInvoiceDetail(id)),
    });
  }

  print() {
    window.print();
  }
}
