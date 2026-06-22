import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, finalize, map, of } from 'rxjs';

import { InvoiceService } from '../../../../core/services/invoice.service';
import { ClientsService } from '../../../../core/services/clients.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ClientListItem } from '../../../../core/models/client.models';
import { SiteListItem } from '../../../../core/models/sites.models';
import { BillableDepartmentOption, InvoiceDetail } from '../../../../core/models/invoice.models';

import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    SkeletonLoaderComponent,
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
    MatProgressSpinnerModule,
  ],
  templateUrl: './invoice-form.component.html',
  styleUrl: './invoice-form.component.less',
})
export class InvoiceFormComponent implements OnInit {

  private readonly invoiceService = inject(InvoiceService);
  private readonly clientsService = inject(ClientsService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly saving = signal(false);
  readonly loadingInvoice = signal(false);
  readonly editId = signal<string | null>(null);
  readonly loadingClients = signal(true);
  readonly loadingSites = signal(false);
  readonly loadingRates = signal(false);
  readonly clients = signal<ClientListItem[]>([]);
  readonly sites = signal<SiteListItem[]>([]);
  readonly billableDepartments = signal<BillableDepartmentOption[]>([]);

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
    const id = this.route.snapshot.params['id'];
    const isEdit = !!id && this.route.snapshot.url.some(s => s.path === 'edit');
    if (isEdit) {
      this.editId.set(id);
      this.loadForEdit(id);
    }

    this.clientsService.getAllForSelect().pipe(
      finalize(() => this.loadingClients.set(false)),
    ).subscribe({
      next: items => this.clients.set(items.filter(c => c.id && c.companyName)),
      error: () => this.notification.error('Failed to load clients.'),
    });

    this.form.controls.clientId.valueChanges.subscribe(clientId => {
      this.form.patchValue({ siteId: '' }, { emitEvent: false });
      this.sites.set([]);
      this.billableDepartments.set([]);
      this.resetLineItems();
      if (!clientId) return;

      this.loadingSites.set(true);
      this.clientsService.getSitesForSelect(clientId).pipe(
        finalize(() => this.loadingSites.set(false)),
      ).subscribe({
        next: items => this.sites.set(items.filter(s => s.id && s.siteName)),
        error: () => this.notification.warning('Could not load sites for this client.'),
      });
    });

    this.form.controls.siteId.valueChanges.subscribe(siteId => {
      const clientId = this.form.controls.clientId.value;
      if (clientId && siteId) {
        this.loadBillableDepartments(clientId, siteId);
      }
    });

    this.form.controls.invoiceDate.valueChanges.subscribe(() => {
      const clientId = this.form.controls.clientId.value;
      const siteId = this.form.controls.siteId.value;
      if (clientId && siteId) {
        this.loadBillableDepartments(clientId, siteId);
      }
    });
  }

  compareSelectValue = (a: unknown, b: unknown): boolean => {
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;
    return String(a).toLowerCase() === String(b).toLowerCase();
  };

  get lineItems() {
    return this.form.controls.lineItems;
  }

  createLineItem(departmentId = '') {
    return new FormGroup({
      departmentId: new FormControl(departmentId, { nonNullable: true, validators: Validators.required }),
      quantity: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
      rate: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
      gstRate: new FormControl(18, { nonNullable: true, validators: Validators.required }),
      hsnSacCode: new FormControl('998519', { nonNullable: true }),
    });
  }

  getDepartmentOptionsForRow(rowIndex: number): BillableDepartmentOption[] {
    const currentId = this.lineItems.at(rowIndex).value.departmentId;
    const usedIds = this.lineItems.controls
      .map((ctrl, idx) => (idx === rowIndex ? null : ctrl.value.departmentId))
      .filter((id): id is string => !!id);

    return this.billableDepartments().filter(dept =>
      !usedIds.some(id => this.compareSelectValue(id, dept.departmentId)) ||
      this.compareSelectValue(dept.departmentId, currentId),
    );
  }

  canAddLineItem(): boolean {
    const departments = this.billableDepartments();
    if (!departments.length || !this.form.controls.siteId.value) return false;
    const selectedCount = this.lineItems.controls.filter(c => c.value.departmentId).length;
    return selectedCount < departments.length;
  }

  onDepartmentSelected(rowIndex: number, departmentId: string) {
    const dept = this.billableDepartments().find(d => this.compareSelectValue(d.departmentId, departmentId));
    if (!dept) return;

    this.lineItems.at(rowIndex).patchValue({
      quantity: dept.quantity,
      rate: dept.unitRate,
      hsnSacCode: dept.hsnSacCode || '998519',
    }, { emitEvent: false });
  }

  loadBillableDepartments(clientId: string, siteId: string) {
    const invoiceDate = this.form.controls.invoiceDate.value;
    const month = invoiceDate.getMonth() + 1;
    const year = invoiceDate.getFullYear();

    this.loadingRates.set(true);
    this.invoiceService.getSuggestedLineItems(clientId, siteId, month, year).pipe(
      map(items => this.filterBillableDepartments(items)),
      catchError(() => of([] as BillableDepartmentOption[])),
      finalize(() => this.loadingRates.set(false)),
    ).subscribe({
      next: departments => {
        this.billableDepartments.set(departments);
        if (departments.length === 0) {
          this.notification.info('No billable line items for this site. Configure pay grades under departments/designations or assign employees to the site.');
          this.resetLineItems();
          return;
        }
        this.applyDepartmentRows(departments);
      },
      error: () => {
        this.billableDepartments.set([]);
        this.notification.warning('Could not load site departments.');
        this.resetLineItems();
      },
    });
  }

  private filterBillableDepartments(items: BillableDepartmentOption[]): BillableDepartmentOption[] {
    return items.filter(item =>
      item.departmentId &&
      item.departmentName &&
      (item.ratePerMonth != null || item.ratePerDay != null || item.unitRate > 0),
    );
  }

  private applyDepartmentRows(departments: BillableDepartmentOption[]) {
    while (this.lineItems.length) this.lineItems.removeAt(0);

    for (const dept of departments) {
      const row = this.createLineItem(dept.departmentId);
      row.patchValue({
        quantity: dept.quantity,
        rate: dept.unitRate,
        hsnSacCode: dept.hsnSacCode || '998519',
      });
      this.lineItems.push(row);
    }
  }

  private resetLineItems() {
    while (this.lineItems.length) this.lineItems.removeAt(0);
    this.lineItems.push(this.createLineItem());
  }

  addLineItem() {
    if (!this.canAddLineItem()) return;
    this.lineItems.push(this.createLineItem());
  }

  removeLineItem(index: number) {
    if (this.lineItems.length > 1) this.lineItems.removeAt(index);
  }

  getLineDescription(rowIndex: number): string {
    const departmentId = this.lineItems.at(rowIndex).value.departmentId;
    const dept = this.billableDepartments().find(d => this.compareSelectValue(d.departmentId, departmentId));
    return dept?.description ?? (dept?.departmentName ? `${dept.departmentName} — Manpower services` : '');
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
    const invoiceDate = raw.invoiceDate.toISOString().split('T')[0];
    const dueDate = raw.dueDate.toISOString().split('T')[0];
    const gstRate = raw.lineItems[0]?.gstRate ?? 18;
    const payload = {
      invoiceDate,
      dueDate,
      gstRate,
      notes: raw.notes || undefined,
      lineItems: raw.lineItems.map((item, index) => ({
        description: this.getLineDescription(index),
        quantity: item.quantity,
        unitRate: item.rate,
        hsnSacCode: item.hsnSacCode || '998519',
      })),
    };

    const editId = this.editId();
    const request$ = editId
      ? this.invoiceService.update(editId, payload)
      : this.invoiceService.create({
          ...payload,
          clientId: raw.clientId,
          siteId: raw.siteId,
          month: raw.invoiceDate.getMonth() + 1,
          year: raw.invoiceDate.getFullYear(),
        });

    request$.subscribe({
      next: (created) => {
        this.notification.success(editId ? 'Invoice updated successfully.' : 'Invoice created successfully.');
        this.router.navigate(['/billing/invoices', editId ?? (created as InvoiceDetail).id]);
      },
      error: () => {
        this.notification.error(editId ? 'Failed to update invoice.' : 'Failed to create invoice.');
        this.saving.set(false);
      },
    });
  }

  private loadForEdit(id: string) {
    this.loadingInvoice.set(true);
    this.invoiceService.getById(id).subscribe({
      next: (inv) => {
        if (inv.status !== 'Draft') {
          this.notification.warning('Only draft invoices can be edited.');
          this.router.navigate(['/billing/invoices', id]);
          return;
        }
        this.form.patchValue({
          clientId: inv.clientId,
          siteId: inv.siteId,
          invoiceDate: new Date(inv.invoiceDate),
          dueDate: new Date(inv.dueDate),
          notes: inv.notes ?? '',
        }, { emitEvent: false });

        if (inv.clientId) {
          this.loadingSites.set(true);
          this.clientsService.getSitesForSelect(inv.clientId).pipe(
            finalize(() => this.loadingSites.set(false)),
          ).subscribe({
            next: items => this.sites.set(items.filter(s => s.id && s.siteName)),
            error: () => this.notification.warning('Could not load sites for this client.'),
          });
        }

        this.lineItems.clear();
        inv.lineItems.forEach(item => {
          this.lineItems.push(new FormGroup({
            departmentId: new FormControl('', { nonNullable: true }),
            quantity: new FormControl(item.quantity, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }),
            rate: new FormControl(item.rate, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
            gstRate: new FormControl(inv.gstRate ?? 18, { nonNullable: true, validators: Validators.required }),
            hsnSacCode: new FormControl(item.hsnSacCode ?? '998519', { nonNullable: true }),
          }));
        });
        this.loadingInvoice.set(false);
      },
      error: () => {
        this.loadingInvoice.set(false);
        this.notification.error('Failed to load invoice.');
        this.router.navigate(['/billing/invoices']);
      },
    });
  }
}
