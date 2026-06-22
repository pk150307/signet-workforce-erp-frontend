import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { finalize } from 'rxjs';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { InvoicePreview, SiteBillingSummary } from '../../../../core/models/invoice.models';

import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({
  selector: 'app-invoice-generate',
  standalone: true,
  imports: [
    SkeletonLoaderComponent,
    NgIf,
    NgFor,
    DecimalPipe,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatInputModule,
  ],
  templateUrl: './invoice-generate.component.html',
  styleUrl: './invoice-generate.component.less',
})
export class InvoiceGenerateComponent implements OnInit {

  private readonly invoiceService = inject(InvoiceService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly loadingSites = signal(true);
  readonly loadingPreview = signal(false);
  readonly generating = signal(false);
  readonly sites = signal<SiteBillingSummary[]>([]);
  readonly preview = signal<InvoicePreview | null>(null);

  readonly months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];
  readonly years = [2024, 2025, 2026, 2027];

  readonly form = new FormGroup({
    month: new FormControl(new Date().getMonth() + 1, { nonNullable: true, validators: Validators.required }),
    year: new FormControl(new Date().getFullYear(), { nonNullable: true, validators: Validators.required }),
    siteId: new FormControl('', { nonNullable: true, validators: Validators.required }),
    gstRate: new FormControl(18, { nonNullable: true, validators: Validators.required }),
  });

  ngOnInit() {
    this.loadSites();
  }

  loadSites() {
    this.loadingSites.set(true);
    this.invoiceService.getGenerateSites().pipe(
      finalize(() => this.loadingSites.set(false)),
    ).subscribe({
      next: sites => this.sites.set(sites),
      error: () => this.notification.error('Failed to load sites.'),
    });
  }

  loadPreview() {
    if (this.form.invalid) return;
    const { month, year, siteId, gstRate } = this.form.getRawValue();
    this.loadingPreview.set(true);
    this.preview.set(null);

    this.invoiceService.previewForSite(siteId, month, year, gstRate).pipe(
      finalize(() => this.loadingPreview.set(false)),
    ).subscribe({
      next: (data) => this.preview.set(data),
      error: (err) => {
        this.notification.error(err?.error?.message ?? 'Failed to load invoice preview.');
      },
    });
  }

  generate() {
    const preview = this.preview();
    if (!preview || preview.alreadyInvoiced || this.generating()) return;

    const { month, year, siteId, gstRate } = this.form.getRawValue();
    this.generating.set(true);

    this.invoiceService.generateForSite({ siteId, month, year, gstRate }).pipe(
      finalize(() => this.generating.set(false)),
    ).subscribe({
      next: (res) => {
        this.notification.success(`Invoice ${res.invoiceNumber} generated successfully.`);
        this.router.navigate(['/billing/invoices', res.invoiceId]);
      },
      error: (err) => {
        this.notification.error(err?.error?.message ?? 'Failed to generate invoice.');
      },
    });
  }

  categoryLabel(category: string): string {
    const map: Record<string, string> = {
      manpower: 'Manpower',
      overtime: 'Overtime',
      pf: 'PF',
      esi: 'ESIC',
    };
    return map[category] ?? category;
  }
}
