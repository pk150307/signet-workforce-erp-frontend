import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ClientsService } from '../../../core/services/clients.service';
import { BillingFilterService } from '../../../core/services/billing-filter.service';
import { ClientListItem } from '../../../core/models/client.models';

interface BillingNavLink {
  label: string;
  path: string;
  icon: string;
  exact: boolean;
}

@Component({
  selector: 'app-billing-subnav',
  standalone: true,
  imports: [
    NgIf, NgFor, RouterLink, RouterLinkActive, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule,
  ],
  template: `
    <div class="billing-shell">
      <nav class="billing-subnav" aria-label="Billing navigation">
        <a
          *ngFor="let link of navLinks"
          mat-stroked-button
          [routerLink]="link.path"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: link.exact }">
          <mat-icon>{{ link.icon }}</mat-icon>
          {{ link.label }}
        </a>
      </nav>

      <form class="billing-context-filter" [formGroup]="filterForm">
        <mat-icon class="billing-context-filter__icon">tune</mat-icon>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Client</mat-label>
          <mat-select formControlName="clientId">
            <mat-option [value]="null">All clients</mat-option>
            <mat-option *ngFor="let c of clients()" [value]="c.id">{{ c.companyName }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Month</mat-label>
          <mat-select formControlName="month">
            <mat-option *ngFor="let m of months" [value]="m.value">{{ m.label }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Year</mat-label>
          <mat-select formControlName="year">
            <mat-option *ngFor="let y of years" [value]="y">{{ y }}</mat-option>
          </mat-select>
        </mat-form-field>
        <button
          mat-stroked-button
          type="button"
          class="billing-context-filter__reset"
          *ngIf="hasActiveFilters()"
          (click)="resetFilters()">
          <mat-icon>filter_alt_off</mat-icon> Reset
        </button>
      </form>
    </div>
  `,
  styleUrl: './billing-subnav.component.less',
})
export class BillingSubnavComponent implements OnInit {
  private readonly clientsService = inject(ClientsService);
  private readonly billingFilter = inject(BillingFilterService);
  private readonly destroyRef = inject(DestroyRef);

  readonly clients = signal<ClientListItem[]>([]);
  readonly months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i, 1).toLocaleString('en', { month: 'long' }),
  }));
  readonly years = [2024, 2025, 2026, 2027];

  readonly navLinks: BillingNavLink[] = [
    { label: 'Dashboard', path: '/billing/dashboard', icon: 'dashboard', exact: true },
    { label: 'Invoices', path: '/billing/invoices', icon: 'receipt_long', exact: false },
    { label: 'Configuration', path: '/billing/configurations', icon: 'settings', exact: false },
    { label: 'Contracts', path: '/billing/contracts', icon: 'description', exact: false },
    { label: 'Reports', path: '/billing/reports', icon: 'analytics', exact: true },
  ];

  readonly filterForm = new FormGroup({
    clientId: new FormControl<string | null>(this.billingFilter.clientId()),
    month: new FormControl(this.billingFilter.month(), { nonNullable: true }),
    year: new FormControl(this.billingFilter.year(), { nonNullable: true }),
  });

  ngOnInit() {
    this.clientsService.getAllForSelect().subscribe({
      next: clients => this.clients.set(clients),
    });

    this.billingFilter.bindControls({
      clientId: this.filterForm.controls.clientId,
      month: this.filterForm.controls.month,
      year: this.filterForm.controls.year,
    }, this.destroyRef);
  }

  hasActiveFilters(): boolean {
    const f = this.billingFilter.filters();
    const now = new Date();
    return Boolean(f.clientId) || f.month !== now.getMonth() + 1 || f.year !== now.getFullYear();
  }

  resetFilters() {
    this.billingFilter.resetAll();
    this.filterForm.setValue({
      clientId: null,
      month: this.billingFilter.month(),
      year: this.billingFilter.year(),
    }, { emitEvent: false });
  }
}
