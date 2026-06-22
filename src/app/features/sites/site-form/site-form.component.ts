import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { catchError, forkJoin, of } from 'rxjs';
import { SitesService } from '../../../core/services/sites.service';
import { ClientsService } from '../../../core/services/clients.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { ClientListItem } from '../../../core/models/client.models';
import { SiteDetail } from '../../../core/models/sites.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-site-form',
  standalone: true,
  imports: [
    NgIf, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatTooltipModule, MatProgressSpinnerModule,
    MatSlideToggleModule, SkeletonLoaderComponent,
  ],
  templateUrl: './site-form.component.html',
  styleUrl: './site-form.component.less',
})
export class SiteFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly sitesService = inject(SitesService);
  private readonly clientsService = inject(ClientsService);
  private readonly notification = inject(NotificationService);
  private readonly breadcrumbService = inject(BreadcrumbService);

  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly isEdit = signal(false);
  readonly clients = signal<ClientListItem[]>([]);
  private siteId: string | null = null;
  private preservedBilling: { day: number | null; month: number | null } = { day: null, month: null };

  readonly form = this.fb.group({
    clientId: ['', Validators.required],
    siteName: ['', Validators.required],
    description: [''],
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    pinCode: [''],
    contactPerson: [''],
    contactPhone: [''],
    contactEmail: ['', Validators.email],
    requiredHeadcount: [0, [Validators.min(0)]],
    isActive: [true],
  });

  ngOnInit() {
    this.siteId = this.route.snapshot.params['id'] ?? null;
    this.isEdit.set(!!this.siteId);
    this.loading.set(true);

    forkJoin({
      clients: this.clientsService.getAllForSelect(),
      site: this.siteId ? this.sitesService.getById(this.siteId) : of(null as SiteDetail | null),
    }).subscribe({
      next: ({ clients, site }) => {
        this.clients.set(clients.filter(c => c.id && c.companyName));

        if (site) {
          this.breadcrumbService.updateLast(site.siteName);
          this.ensureClientOption(site.clientId ?? '', site.clientCompanyName);
          this.preservedBilling = {
            day: site.billingRatePerDay,
            month: site.billingRatePerMonth,
          };
          this.form.patchValue({
            clientId: site.clientId,
            siteName: site.siteName,
            description: site.description ?? '',
            address: site.address,
            city: site.city,
            state: site.state,
            pinCode: site.pinCode ?? '',
            contactPerson: site.contactPerson ?? '',
            contactPhone: site.contactPhone ?? '',
            contactEmail: site.contactEmail ?? '',
            requiredHeadcount: site.requiredHeadcount,
            isActive: site.isActive,
          });
        }

        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Failed to load site form.');
        this.loading.set(false);
      },
    });
  }

  cancel() {
    if (this.isEdit() && this.siteId) {
      this.router.navigate(['/sites', this.siteId]);
    } else {
      this.router.navigate(['/sites']);
    }
  }

  compareSelectValue = (a: unknown, b: unknown): boolean => {
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;
    return String(a).toLowerCase() === String(b).toLowerCase();
  };

  private ensureClientOption(clientId: string, companyName: string) {
    if (!clientId) return;
    if (this.clients().some(c => this.compareSelectValue(c.id, clientId))) return;

    this.clients.update(list => [{
      id: clientId,
      clientCode: '',
      companyName: companyName || 'Client',
      contactPerson: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      isActive: true,
      totalSites: 0,
    }, ...list]);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const value = this.form.getRawValue();
    const payload = {
      clientId: value.clientId!,
      siteName: value.siteName!,
      description: value.description || undefined,
      address: value.address!,
      city: value.city!,
      state: value.state!,
      pinCode: value.pinCode || undefined,
      contactPerson: value.contactPerson || undefined,
      contactPhone: value.contactPhone || undefined,
      contactEmail: value.contactEmail || undefined,
      requiredHeadcount: value.requiredHeadcount ?? 0,
      isActive: value.isActive ?? true,
      ...(this.isEdit() ? {
        billingRatePerDay: this.preservedBilling.day,
        billingRatePerMonth: this.preservedBilling.month,
      } : {}),
    };

    const req$ = this.isEdit() && this.siteId
      ? this.sitesService.update(this.siteId, payload)
      : this.sitesService.create(payload);

    req$.subscribe({
      next: res => {
        this.notification.success('Site saved.');
        const createdId = (res as { id?: string })?.id;
        const targetId = this.isEdit() && this.siteId ? this.siteId : createdId;
        this.router.navigate(targetId ? ['/sites', targetId] : ['/sites']);
      },
      error: () => {
        this.notification.error('Failed to save site.');
        this.saving.set(false);
      },
    });
  }
}
