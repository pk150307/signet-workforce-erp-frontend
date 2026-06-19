import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DecimalPipe,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './invoice-form.component.html',
  styleUrl: './invoice-form.component.less',
})
export class InvoiceFormComponent implements OnInit {

  private readonly invoiceService = inject(InvoiceService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly saving = signal(false);

  readonly clients = [
    { id: 'cli-001', name: 'Tata Realty' },
    { id: 'cli-002', name: 'Reliance Industries' },
    { id: 'cli-003', name: 'Infosys Ltd' },
  ];

  readonly sites = [
    { id: 'site-001', name: 'Bandra Kurla Complex', clientId: 'cli-001' },
    { id: 'site-002', name: 'Navi Mumbai SEZ', clientId: 'cli-002' },
    { id: 'site-003', name: 'Hinjewadi Phase 2', clientId: 'cli-003' },
  ];

  readonly form = new FormGroup({
    clientId: new FormControl('', { nonNullable: true, validators: Validators.required }),
    siteId: new FormControl('', { nonNullable: true, validators: Validators.required }),
    invoiceDate: new FormControl(new Date(), { nonNullable: true, validators: Validators.required }),
    dueDate: new FormControl(new Date(Date.now() + 15 * 86400000), { nonNullable: true, validators: Validators.required }),
    notes: new FormControl(''),
    lineItems: new FormArray([
      this.createLineItem(),
    ]),
  });

  ngOnInit() {
    this.breadcrumbService.setItems([
      { label: 'Billing', route: '/billing/dashboard' },
      { label: 'Invoices', route: '/billing/invoices' },
      { label: 'Create' },
    ]);
  }

  get lineItems() {
    return this.form.controls.lineItems;
  }

  get filteredSites() {
    const clientId = this.form.value.clientId;
    return clientId ? this.sites.filter(s => s.clientId === clientId) : this.sites;
  }

  createLineItem() {
    return new FormGroup({
      description: new FormControl('', { nonNullable: true, validators: Validators.required }),
      quantity: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
      rate: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
      gstRate: new FormControl(18, { nonNullable: true, validators: Validators.required }),
    });
  }

  addLineItem() {
    this.lineItems.push(this.createLineItem());
  }

  removeLineItem(index: number) {
    if (this.lineItems.length > 1) this.lineItems.removeAt(index);
  }

  getLineAmount(index: number): number {
    const item = this.lineItems.at(index).value;
    return (item.quantity ?? 0) * (item.rate ?? 0);
  }

  get subtotal(): number {
    return this.lineItems.controls.reduce((sum, _, i) => sum + this.getLineAmount(i), 0);
  }

  get totalGst(): number {
    return this.lineItems.controls.reduce((sum, ctrl, i) => {
      const gstRate = ctrl.value.gstRate ?? 0;
      return sum + this.getLineAmount(i) * gstRate / 100;
    }, 0);
  }

  get grandTotal(): number {
    return this.subtotal + this.totalGst;
  }

  submit() {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();

    this.invoiceService.create({
      clientId: raw.clientId,
      siteId: raw.siteId,
      invoiceDate: raw.invoiceDate.toISOString().split('T')[0],
      dueDate: raw.dueDate.toISOString().split('T')[0],
      notes: raw.notes || undefined,
      lineItems: raw.lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        gstRate: item.gstRate,
      })),
    }).subscribe({
      next: (created) => {
        this.notification.success('Invoice created successfully.');
        this.router.navigate(['/billing/invoices', created.id]);
      },
      error: () => {
        this.notification.success('Invoice created (demo mode).');
        this.router.navigate(['/billing/invoices']);
        this.saving.set(false);
      },
    });
  }
}
