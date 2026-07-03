import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf, NgFor, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';
import { ContractService } from '../../../../core/services/contract.service';
import { ClientsService } from '../../../../core/services/clients.service';
import { SitesService } from '../../../../core/services/sites.service';
import { BillingFilterService } from '../../../../core/services/billing-filter.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ClientListItem } from '../../../../core/models/client.models';
import { SiteListItem } from '../../../../core/models/sites.models';
import { BillingSubnavComponent } from '../../shared/billing-subnav.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';

function firstOfMonth(year: number, month: number): Date {
  return new Date(year, month - 1, 1);
}

function toIsoDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

@Component({
  selector: 'app-contract-form',
  standalone: true,
  imports: [
    NgIf, NgFor, TitleCasePipe, RouterLink, ReactiveFormsModule,
    MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule,
    MatIconModule, MatCheckboxModule, MatDatepickerModule, MatNativeDateModule,
    MatTooltipModule, BillingSubnavComponent, SkeletonLoaderComponent,
  ],
  templateUrl: './contract-form.component.html',
  styleUrl: './contract-form.component.less',
})
export class ContractFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ContractService);
  private readonly clientsService = inject(ClientsService);
  private readonly sitesService = inject(SitesService);
  readonly billingFilter = inject(BillingFilterService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly suggesting = signal(false);
  readonly clients = signal<ClientListItem[]>([]);
  readonly sites = signal<SiteListItem[]>([]);
  readonly isEdit = signal(false);
  private contractId: string | null = null;
  private autoFields = { name: true, code: true, prefix: true };

  readonly statusOptions = ['draft', 'active', 'expired', 'terminated', 'cancelled'];

  readonly form = new FormGroup({
    clientId: new FormControl('', { nonNullable: true, validators: Validators.required }),
    siteId: new FormControl<string | null>(null),
    contractName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    contractCode: new FormControl('', { nonNullable: true, validators: Validators.required }),
    startDate: new FormControl<Date>(firstOfMonth(new Date().getFullYear(), new Date().getMonth() + 1), {
      nonNullable: true,
      validators: Validators.required,
    }),
    endDate: new FormControl<Date | null>(null),
    billingType: new FormControl('monthly', { nonNullable: true }),
    billingRate: new FormControl<number | null>(null),
    pfPct: new FormControl(13, { nonNullable: true }),
    esicPct: new FormControl(3.25, { nonNullable: true }),
    lwfPct: new FormControl(0.4, { nonNullable: true }),
    serviceChargePct: new FormControl(6, { nonNullable: true }),
    gstPct: new FormControl(18, { nonNullable: true }),
    invoiceFrequency: new FormControl('monthly', { nonNullable: true }),
    invoicePrefix: new FormControl('', { nonNullable: true }),
    status: new FormControl('active', { nonNullable: true }),
    notes: new FormControl<string | null>(null),
    syncBillingConfiguration: new FormControl(true, { nonNullable: true }),
  });

  ngOnInit() {
    this.contractId = this.route.snapshot.params['id'] ?? null;
    this.isEdit.set(!!this.contractId && this.route.snapshot.url.some(s => s.path === 'edit'));

    this.form.controls.startDate.setValue(
      firstOfMonth(this.billingFilter.year(), this.billingFilter.month()),
    );

    this.clientsService.getAllForSelect().subscribe(c => this.clients.set(c));

    this.form.controls.clientId.valueChanges.subscribe(clientId => {
      if (!clientId) { this.sites.set([]); return; }
      this.sitesService.getAll({ clientId, page: 1, pageSize: 100, isActive: true }).subscribe(r => {
        this.sites.set(r.items);
        if (!this.isEdit()) this.loadSuggestions();
      });
    });

    this.form.controls.siteId.valueChanges.subscribe(() => {
      if (!this.isEdit()) this.loadSuggestions();
    });

    this.form.controls.contractName.valueChanges.subscribe(() => { this.autoFields.name = false; });
    this.form.controls.contractCode.valueChanges.subscribe(() => { this.autoFields.code = false; });
    this.form.controls.invoicePrefix.valueChanges.subscribe(() => { this.autoFields.prefix = false; });

    if (!this.isEdit()) {
      const clientId = this.billingFilter.clientId();
      if (clientId) this.form.patchValue({ clientId });
    }

    if (this.isEdit() && this.contractId) {
      this.autoFields = { name: false, code: false, prefix: false };
      this.loading.set(true);
      this.service.getById(this.contractId).pipe(finalize(() => this.loading.set(false))).subscribe({
        next: c => {
          this.form.patchValue({
            clientId: c.clientId,
            siteId: c.siteId,
            contractName: c.contractName,
            contractCode: c.contractCode,
            startDate: c.startDate ? new Date(c.startDate) : new Date(),
            endDate: c.endDate ? new Date(c.endDate) : null,
            billingType: c.billingType,
            billingRate: c.billingRate,
            pfPct: c.pfPct ?? 13,
            esicPct: c.esicPct ?? 3.25,
            lwfPct: c.lwfPct ?? 0.4,
            serviceChargePct: c.serviceChargePct ?? 6,
            gstPct: c.gstPct ?? 18,
            invoiceFrequency: c.invoiceFrequency ?? 'monthly',
            invoicePrefix: c.invoicePrefix ?? '',
            status: c.status,
            notes: c.notes,
          });
          this.form.controls.clientId.disable();
        },
        error: () => this.notification.error('Failed to load contract.'),
      });
    }
  }

  loadSuggestions() {
    const clientId = this.form.controls.clientId.value;
    if (!clientId || this.isEdit()) return;

    this.suggesting.set(true);
    this.service.suggestDefaults(clientId, this.form.controls.siteId.value).pipe(
      finalize(() => this.suggesting.set(false)),
    ).subscribe({
      next: s => {
        if (this.autoFields.name) this.form.controls.contractName.setValue(s.contractName, { emitEvent: false });
        if (this.autoFields.code) this.form.controls.contractCode.setValue(s.contractCode, { emitEvent: false });
        if (this.autoFields.prefix) this.form.controls.invoicePrefix.setValue(s.invoicePrefix, { emitEvent: false });
      },
    });
  }

  regenerateField(field: 'name' | 'code' | 'prefix') {
    this.autoFields[field] = true;
    this.loadSuggestions();
  }

  save() {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const payload: Record<string, unknown> = {
      clientId: raw.clientId,
      siteId: raw.siteId || null,
      contractName: raw.contractName.trim(),
      startDate: toIsoDate(raw.startDate),
      endDate: toIsoDate(raw.endDate),
      billingType: raw.billingType,
      billingRate: raw.billingRate,
      pfPct: raw.pfPct,
      esicPct: raw.esicPct,
      lwfPct: raw.lwfPct,
      serviceChargePct: raw.serviceChargePct,
      gstPct: raw.gstPct,
      invoiceFrequency: raw.invoiceFrequency,
      invoicePrefix: raw.invoicePrefix?.trim() || null,
      status: raw.status,
      notes: raw.notes,
      syncBillingConfiguration: raw.syncBillingConfiguration,
    };

    const code = raw.contractCode?.trim();
    if (code) payload['contractCode'] = code;

    this.saving.set(true);
    const req = this.isEdit() && this.contractId
      ? this.service.update(this.contractId, payload)
      : this.service.create(payload);

    req.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.notification.success(this.isEdit() ? 'Contract updated.' : 'Contract created.');
        this.router.navigate(['/billing/contracts']);
      },
      error: (err) => this.notification.error(err?.error?.message ?? err?.error?.title ?? 'Save failed.'),
    });
  }
}
