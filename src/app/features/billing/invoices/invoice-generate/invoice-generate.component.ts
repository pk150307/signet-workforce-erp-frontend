import { Component, OnInit, inject, signal, DestroyRef, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { finalize } from 'rxjs';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { BillingEngineService } from '../../../../core/services/billing-engine.service';
import { BillingFilterService } from '../../../../core/services/billing-filter.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { BillingEngineResult } from '../../../../core/models/billing.models';
import { SiteBillingSummary } from '../../../../core/models/invoice.models';
import { BillingSubnavComponent } from '../../shared/billing-subnav.component';
import { BillingPrerequisitesComponent } from '../../shared/billing-prerequisites.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-invoice-generate',
  standalone: true,
  imports: [
    BillingSubnavComponent,
    BillingPrerequisitesComponent,
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
    MatChipsModule,
  ],
  templateUrl: './invoice-generate.component.html',
  styleUrl: './invoice-generate.component.less',
})
export class InvoiceGenerateComponent implements OnInit {

  private readonly invoiceService = inject(InvoiceService);
  private readonly engineService = inject(BillingEngineService);
  readonly billingFilter = inject(BillingFilterService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loadingSites = signal(true);
  readonly loadingPreview = signal(false);
  readonly generating = signal(false);
  readonly allSites = signal<SiteBillingSummary[]>([]);
  readonly preview = signal<BillingEngineResult | null>(null);

  readonly sites = computed(() => {
    const clientId = this.billingFilter.clientId();
    const items = this.allSites();
    return clientId ? items.filter(s => s.clientId === clientId) : items;
  });

  readonly form = new FormGroup({
    siteId: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  ngOnInit() {
    this.loadSites();
    this.billingFilter.filterChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.preview.set(null);
      const siteId = this.form.controls.siteId.value;
      if (siteId && !this.sites().some(s => s.siteId === siteId)) {
        this.form.controls.siteId.setValue('');
      }
    });
  }

  loadSites() {
    this.loadingSites.set(true);
    this.invoiceService.getGenerateSites().pipe(
      finalize(() => this.loadingSites.set(false)),
    ).subscribe({
      next: sites => this.allSites.set(sites),
      error: () => this.notification.error('Failed to load sites.'),
    });
  }

  selectedSite(): SiteBillingSummary | undefined {
    const siteId = this.form.controls.siteId.value;
    return this.sites().find(s => s.siteId === siteId);
  }

  loadPreview() {
    if (this.form.invalid) return;
    const site = this.selectedSite();
    if (!site?.clientId) {
      this.notification.warning('Select a client in the billing toolbar and choose a site.');
      return;
    }

    this.loadingPreview.set(true);
    this.preview.set(null);

    this.engineService.preview({
      month: this.billingFilter.month(),
      year: this.billingFilter.year(),
      clientId: site.clientId,
      siteId: site.siteId,
    }).pipe(
      finalize(() => this.loadingPreview.set(false)),
    ).subscribe({
      next: (data) => {
        this.preview.set(data);
        const messages = [...data.validation.errors, ...data.validation.warnings];
        if (messages.length) {
          this.notification.warning(messages.join(' '));
        }
      },
      error: (err) => {
        this.notification.error(err?.error?.title ?? err?.error?.message ?? 'Failed to load invoice preview.');
      },
    });
  }

  generate() {
    const preview = this.preview();
    const site = this.selectedSite();
    if (!preview || preview.alreadyInvoiced || this.generating() || !site?.clientId) return;

    if (!preview.validation.valid) {
      this.notification.error(preview.validation.errors.join(' ') || 'Fix validation issues before generating.');
      return;
    }

    this.generating.set(true);

    this.invoiceService.generateFromEngine({
      month: this.billingFilter.month(),
      year: this.billingFilter.year(),
      clientId: site.clientId,
      siteId: site.siteId,
    }).pipe(
      finalize(() => this.generating.set(false)),
    ).subscribe({
      next: (res) => {
        this.notification.success(`Invoice ${res.invoiceNumber} generated successfully.`);
        this.router.navigate(['/billing/invoices', res.invoiceId]);
      },
      error: (err) => {
        const status = err?.status;
        const msg = err?.error?.message ?? err?.error?.title ?? err?.error?.detail;
        if (status === 409) {
          this.notification.warning(msg ?? 'An invoice already exists for this site and period.');
          return;
        }
        if (status === 500 && /database|connection|timeout/i.test(String(msg ?? ''))) {
          this.notification.error('Database connection issue. Please retry in a moment.');
          return;
        }
        this.notification.error(msg ?? 'Failed to generate invoice.');
      },
    });
  }
}
