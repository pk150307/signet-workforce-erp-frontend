import { Component, OnInit, inject, signal } from '@angular/core';

import { FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';

import { CompanyService } from '../../../core/services/company.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CompanyProfile } from '../../../core/models/company.models';

@Component({
  selector: 'app-company-profile',
    templateUrl: './company-profile.component.html',
  styleUrl: './company-profile.component.less',
})
export class CompanyProfileComponent implements OnInit {

  private readonly companyService = inject(CompanyService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  readonly router = inject(Router);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly logoPreview = signal<string | null>(null);
  readonly sectionItems = [
    { label: 'Company Info', value: 'info' },
    { label: 'GST & Tax', value: 'gst' },
    { label: 'Billing Address', value: 'billing' },
  ];
  readonly activeSection = signal('info');

  readonly form = this.fb.group({
    companyName: ['', Validators.required],
    legalName: ['', Validators.required],
    registrationNumber: [''],
    gstNumber: [''],
    panNumber: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    website: [''],
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    pinCode: [''],
    billingAddress: [''],
    billingCity: [''],
    billingState: [''],
    billingPinCode: [''],
  });

  ngOnInit() {
    this.companyService.getProfile().subscribe({
      next: (profile) => {
        this.form.patchValue(profile);
        this.logoPreview.set(this.companyService.resolveLogoUrl(profile.logoUrl));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.logoPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  copyBillingFromCompany() {
    this.form.patchValue({
      billingAddress: this.form.value.address,
      billingCity: this.form.value.city,
      billingState: this.form.value.state,
      billingPinCode: this.form.value.pinCode,
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.companyService.updateProfile(this.form.getRawValue() as Partial<CompanyProfile>).subscribe({
      next: () => {
        this.notification.success('Company profile updated.');
        this.companyService.refreshProfile().subscribe({
          next: (profile) => this.logoPreview.set(this.companyService.resolveLogoUrl(profile.logoUrl)),
        });
        this.saving.set(false);
      },
      error: () => {
        this.notification.error('Failed to update company profile.');
        this.saving.set(false);
      },
    });
  }
}
