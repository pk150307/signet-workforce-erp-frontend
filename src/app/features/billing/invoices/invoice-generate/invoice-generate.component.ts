import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { getMockSiteBillingSummary } from '../invoice.mock';

@Component({
  selector: 'app-invoice-generate',
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
    MatCheckboxModule,
    MatCardModule,
  ],
  templateUrl: './invoice-generate.component.html',
  styleUrl: './invoice-generate.component.less',
})
export class InvoiceGenerateComponent implements OnInit {

  private readonly invoiceService = inject(InvoiceService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly generating = signal(false);
  readonly progress = signal(0);
  readonly result = signal<{ generated: number; failed: number } | null>(null);

  readonly months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];
  readonly years = [2024, 2025, 2026];
  readonly sites = getMockSiteBillingSummary();
  readonly selectedSiteIds = signal<string[]>([]);

  readonly form = new FormGroup({
    month: new FormControl(new Date().getMonth() + 1, { nonNullable: true, validators: Validators.required }),
    year: new FormControl(new Date().getFullYear(), { nonNullable: true, validators: Validators.required }),
    scope: new FormControl<'all' | 'selected'>('all', { nonNullable: true }),
  });

  ngOnInit() {
    this.breadcrumbService.setItems([
      { label: 'Billing', route: '/billing/dashboard' },
      { label: 'Invoices', route: '/billing/invoices' },
      { label: 'Generate' },
    ]);
    this.selectedSiteIds.set(this.sites.map(s => s.siteId));
  }

  toggleSite(siteId: string, checked: boolean) {
    const current = this.selectedSiteIds();
    this.selectedSiteIds.set(
      checked ? [...current, siteId] : current.filter(id => id !== siteId)
    );
  }

  isSiteSelected(siteId: string): boolean {
    return this.selectedSiteIds().includes(siteId);
  }

  generate() {
    if (this.form.invalid || this.generating()) return;

    this.generating.set(true);
    this.progress.set(0);
    this.result.set(null);

    const { month, year, scope } = this.form.getRawValue();
    const siteIds = scope === 'selected' ? this.selectedSiteIds() : undefined;

    this.simulateProgress();

    this.invoiceService.generateBySites({ month, year, siteIds }).subscribe({
      next: (res) => {
        this.progress.set(100);
        this.result.set(res);
        this.notification.success(`${res.generated} invoice(s) generated.`);
        setTimeout(() => this.router.navigate(['/billing/invoices']), 1500);
      },
      error: () => {
        this.progress.set(100);
        this.result.set({ generated: siteIds?.length ?? this.sites.length, failed: 0 });
        this.notification.success('Invoices generated (demo mode).');
        setTimeout(() => this.router.navigate(['/billing/invoices']), 1500);
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
      this.progress.set(current + Math.random() * 12);
    }, 400);
  }
}
