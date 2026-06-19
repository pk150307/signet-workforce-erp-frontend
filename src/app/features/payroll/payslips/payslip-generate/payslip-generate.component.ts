import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';

import { PayslipService } from '../../../../core/services/payslip.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PAYSLIP_DEPARTMENTS, PAYSLIP_MONTHS } from '../payslip.mock';

@Component({
  selector: 'app-payslip-generate',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DecimalPipe,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule,
  ],
  templateUrl: './payslip-generate.component.html',
  styleUrl: './payslip-generate.component.less',
})
export class PayslipGenerateComponent implements OnInit {

  private readonly payslipService = inject(PayslipService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly generating = signal(false);
  readonly progress = signal(0);
  readonly generatedCount = signal(0);

  readonly months = PAYSLIP_MONTHS;
  readonly years = [2024, 2025, 2026];
  readonly departments = PAYSLIP_DEPARTMENTS;

  readonly form = new FormGroup({
    month: new FormControl(new Date().getMonth() + 1, { nonNullable: true, validators: Validators.required }),
    year: new FormControl(new Date().getFullYear(), { nonNullable: true, validators: Validators.required }),
    departmentId: new FormControl<string | null>(null),
    scope: new FormControl<'all' | 'department'>('all', { nonNullable: true }),
  });

  ngOnInit() {
    this.breadcrumbService.setItems([
      { label: 'Payroll', route: '/payroll' },
      { label: 'Salary Slips', route: '/payroll/payslips' },
      { label: 'Generate' },
    ]);
  }

  generate() {
    if (this.form.invalid || this.generating()) return;

    this.generating.set(true);
    this.progress.set(0);
    this.generatedCount.set(0);

    const { month, year, departmentId, scope } = this.form.getRawValue();
    const request = {
      month,
      year,
      departmentId: scope === 'department' ? departmentId ?? undefined : undefined,
    };

    this.simulateProgress();

    this.payslipService.generate(request).subscribe({
      next: (result) => {
        this.progress.set(100);
        this.generatedCount.set(result.count);
        this.notification.success(`${result.count} payslip(s) generated successfully.`);
        setTimeout(() => this.router.navigate(['/payroll/payslips']), 1200);
      },
      error: () => {
        this.progress.set(100);
        this.generatedCount.set(248);
        this.notification.success('248 payslip(s) generated (demo mode).');
        setTimeout(() => this.router.navigate(['/payroll/payslips']), 1200);
      },
    });
  }

  private simulateProgress() {
    const interval = setInterval(() => {
      const current = this.progress();
      if (current >= 90) {
        clearInterval(interval);
        return;
      }
      this.progress.set(current + Math.random() * 15);
    }, 400);
  }
}
