import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClientsService } from '../../../core/services/clients.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { CreateClientRequest } from '../../../core/models/client.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    SkeletonLoaderComponent,
  ],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.less',
})
export class ClientFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly clientsService = inject(ClientsService);
  private readonly notification = inject(NotificationService);
  private readonly breadcrumbService = inject(BreadcrumbService);

  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly isEdit = signal(false);
  private clientId: string | null = null;

  readonly form = this.fb.group({
    companyName: ['', Validators.required],
    contactPerson: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    gstNumber: [''],
    panNumber: [''],
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    pinCode: [''],
    notes: [''],
  });

  ngOnInit() {
    this.clientId = this.route.snapshot.params['id'] ?? null;
    this.isEdit.set(!!this.clientId);
    if (!this.clientId) return;

    this.loading.set(true);
    this.clientsService.getById(this.clientId).subscribe({
      next: client => {
        this.breadcrumbService.updateLast(client.companyName);
        this.form.patchValue({
          companyName: client.companyName,
          contactPerson: client.contactPerson,
          email: client.email,
          phone: client.phone,
          gstNumber: client.gstNumber ?? '',
          panNumber: client.panNumber ?? '',
          address: client.address,
          city: client.city,
          state: client.state,
          pinCode: client.pinCode ?? '',
          notes: client.notes ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Failed to load client.');
        this.loading.set(false);
      },
    });
  }

  cancel() {
    if (this.isEdit() && this.clientId) {
      this.router.navigate(['/clients', this.clientId]);
    } else {
      this.router.navigate(['/clients']);
    }
  }

  private buildPayload(): CreateClientRequest {
    const raw = this.form.getRawValue();
    return {
      companyName: raw.companyName!,
      contactPerson: raw.contactPerson!,
      email: raw.email!,
      phone: raw.phone!,
      gstNumber: raw.gstNumber || undefined,
      panNumber: raw.panNumber || undefined,
      address: raw.address!,
      city: raw.city!,
      state: raw.state!,
      pinCode: raw.pinCode || undefined,
      notes: raw.notes || undefined,
    };
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const payload = this.buildPayload();
    const req$ = this.isEdit() && this.clientId
      ? this.clientsService.update(this.clientId, payload)
      : this.clientsService.create(payload);
    req$.subscribe({
      next: res => {
        this.notification.success('Client saved.');
        const createdId = (res as { id?: string })?.id;
        const targetId = this.isEdit() && this.clientId ? this.clientId : createdId;
        this.router.navigate(targetId ? ['/clients', targetId] : ['/clients']);
      },
      error: () => {
        this.notification.error('Failed to save client.');
        this.saving.set(false);
      },
    });
  }
}
