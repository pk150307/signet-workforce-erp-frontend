import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { PayslipDetail } from '../../../../core/models/payslip.models';
import { CompanyProfile } from '../../../../core/models/company.models';
import { CompanyService } from '../../../../core/services/company.service';
import { PAYSLIP_MONTHS } from '../payslip.mock';
import { ApiDatePipe } from '../../../../shared/pipes/api-date.pipe';

@Component({
  selector: 'app-payslip-document',
  standalone: true,
  imports: [NgIf, NgFor, DecimalPipe, ApiDatePipe],
  templateUrl: './payslip-document.component.html',
  styleUrl: './payslip-document.component.less',
})
export class PayslipDocumentComponent implements OnInit {
  @Input({ required: true }) ps!: PayslipDetail;

  private readonly companyService = inject(CompanyService);

  readonly company = signal<CompanyProfile | null>(null);
  readonly logoUrl = signal<string>('');

  ngOnInit() {
    this.companyService.getProfile().subscribe({
      next: (profile) => {
        this.company.set(profile);
        this.logoUrl.set(this.companyService.resolveLogoUrl(profile.logoUrl));
      },
    });
  }

  monthLabel(): string {
    return PAYSLIP_MONTHS.find(m => m.value === this.ps.month)?.label ?? String(this.ps.month);
  }

  companyAddress(): string {
    const profile = this.company();
    if (!profile) return '—';
    return this.companyService.formatAddress(profile).replace(/\n/g, ', ');
  }

  totalEarnings(): number {
    return this.ps.earnings.reduce((sum, item) => sum + item.amount, 0);
  }

  totalDeductions(): number {
    return this.ps.deductions.reduce((sum, item) => sum + item.amount, 0);
  }
}
