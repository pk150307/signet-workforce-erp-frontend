import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PayslipService } from '../../../../core/services/payslip.service';
import { PayslipDetail } from '../../../../core/models/payslip.models';
import { getMockPayslipDetail } from '../payslip.mock';
import { PAYSLIP_MONTHS } from '../payslip.mock';

@Component({
  selector: 'app-payslip-print',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, DecimalPipe, MatButtonModule, MatIconModule],
  templateUrl: './payslip-print.component.html',
  styleUrl: './payslip-print.component.less',
})
export class PayslipPrintComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly payslipService = inject(PayslipService);

  readonly payslip = signal<PayslipDetail | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.payslipService.getById(id).subscribe({
      next: (detail) => this.payslip.set(detail),
      error: () => this.payslip.set(getMockPayslipDetail(id)),
    });
  }

  print() {
    window.print();
  }

  getMonthLabel(month: number): string {
    return PAYSLIP_MONTHS.find(m => m.value === month)?.label ?? String(month);
  }

  get totalEarnings(): number {
    return this.payslip()?.earnings.reduce((s, e) => s + e.amount, 0) ?? 0;
  }

  get totalDeductions(): number {
    return this.payslip()?.deductions.reduce((s, d) => s + d.amount, 0) ?? 0;
  }
}
