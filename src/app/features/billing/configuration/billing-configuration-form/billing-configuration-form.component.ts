import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { finalize } from 'rxjs';
import { BillingConfigurationService } from '../../../../core/services/billing-configuration.service';
import { ClientsService } from '../../../../core/services/clients.service';
import { SitesService } from '../../../../core/services/sites.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ClientListItem } from '../../../../core/models/client.models';
import { SiteListItem } from '../../../../core/models/sites.models';
import { BillingComponentMaster } from '../../../../core/models/billing.models';
import { BillingSubnavComponent } from '../../shared/billing-subnav.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-billing-configuration-form',
  standalone: true,
  imports: [
    NgIf, NgFor, RouterLink, ReactiveFormsModule,
    MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule,
    MatIconModule, MatCheckboxModule, BillingSubnavComponent, SkeletonLoaderComponent,
  ],
  templateUrl: './billing-configuration-form.component.html',
  styleUrl: './billing-configuration-form.component.less',
})
export class BillingConfigurationFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(BillingConfigurationService);
  private readonly clientsService = inject(ClientsService);
  private readonly sitesService = inject(SitesService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly clients = signal<ClientListItem[]>([]);
  readonly sites = signal<SiteListItem[]>([]);
  readonly components = signal<BillingComponentMaster[]>([]);
  readonly enabledMap = signal<Record<string, boolean>>({});
  readonly isEdit = signal(false);
  private configId: string | null = null;

  readonly form = new FormGroup({
    clientId: new FormControl('', { nonNullable: true, validators: Validators.required }),
    siteId: new FormControl('', { nonNullable: true, validators: Validators.required }),
    billingType: new FormControl('monthly', { nonNullable: true }),
    billingRate: new FormControl<number | null>(null),
    requiredHeadcount: new FormControl<number | null>(null),
    serviceChargePct: new FormControl(6, { nonNullable: true }),
    pfPct: new FormControl(13, { nonNullable: true }),
    esicPct: new FormControl(3.25, { nonNullable: true }),
    lwfPct: new FormControl(0.4, { nonNullable: true }),
    gstPct: new FormControl(18, { nonNullable: true }),
    gstType: new FormControl('cgst_sgst', { nonNullable: true }),
    billingCycle: new FormControl('monthly', { nonNullable: true }),
    invoiceDueDays: new FormControl(30, { nonNullable: true }),
    sacCode: new FormControl('998519', { nonNullable: true }),
    natureOfService: new FormControl('Manpower Supply Services'),
    invoicePrefix: new FormControl<string | null>(null),
    isActive: new FormControl(true, { nonNullable: true }),
  });

  ngOnInit() {
    this.configId = this.route.snapshot.params['id'] ?? null;
    this.isEdit.set(!!this.configId && this.route.snapshot.url.some(s => s.path === 'edit'));

    this.clientsService.getAllForSelect().subscribe(c => this.clients.set(c));
    this.service.listMasterComponents().subscribe(c => {
      this.components.set(c);
      const map: Record<string, boolean> = {};
      c.forEach(comp => { map[comp.id] = comp.isEnabledByDefault; });
      this.enabledMap.set(map);
    });

    this.form.controls.clientId.valueChanges.subscribe(clientId => {
      if (!clientId) { this.sites.set([]); return; }
      this.sitesService.getAll({ clientId, page: 1, pageSize: 100, isActive: true }).subscribe(r => this.sites.set(r.items));
    });

    if (this.isEdit() && this.configId) {
      this.loading.set(true);
      this.service.getById(this.configId).pipe(finalize(() => this.loading.set(false))).subscribe({
        next: cfg => {
          this.form.patchValue({
            clientId: cfg.clientId,
            siteId: cfg.siteId,
            billingType: cfg.billingType,
            billingRate: cfg.billingRate,
            requiredHeadcount: cfg.requiredHeadcount,
            serviceChargePct: cfg.serviceChargePct ?? 6,
            pfPct: cfg.pfPct ?? 13,
            esicPct: cfg.esicPct ?? 3.25,
            lwfPct: cfg.lwfPct ?? 0.4,
            gstPct: cfg.gstPct,
            gstType: cfg.gstType,
            billingCycle: cfg.billingCycle,
            invoiceDueDays: cfg.invoiceDueDays,
            sacCode: cfg.sacCode,
            natureOfService: cfg.natureOfService,
            invoicePrefix: cfg.invoicePrefix,
            isActive: cfg.isActive,
          });
          const map: Record<string, boolean> = {};
          cfg.components.forEach(c => { map[c.billingComponentId] = c.isEnabled; });
          this.enabledMap.set(map);
          this.form.controls.clientId.disable();
          this.form.controls.siteId.disable();
        },
        error: () => this.notification.error('Failed to load configuration.'),
      });
    }
  }

  toggleComponent(id: string, enabled: boolean) {
    this.enabledMap.update(m => ({ ...m, [id]: enabled }));
  }

  save() {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      components: this.components().map((c, i) => ({
        billingComponentId: c.id,
        isEnabled: this.enabledMap()[c.id] ?? c.isEnabledByDefault,
        sortOrder: i,
      })),
    };

    this.saving.set(true);
    const req = this.isEdit() && this.configId
      ? this.service.update(this.configId, payload)
      : this.service.create(payload);

    req.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.notification.success('Billing configuration saved.');
        this.router.navigate(['/billing/configurations']);
      },
      error: (err) => this.notification.error(err?.error?.message ?? 'Save failed.'),
    });
  }
}
