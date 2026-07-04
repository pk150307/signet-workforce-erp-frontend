import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { EmployeeService } from '../../../../core/services/employee.service';
import { DepartmentService } from '../../../../core/services/department.service';
import { DesignationService } from '../../../../core/services/designation.service';
import { SitesService } from '../../../../core/services/sites.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { EmployeeListItem } from '../../../../core/models/employee.models';
import { DepartmentListItem } from '../../../../core/models/department.models';
import { DesignationListItem } from '../../../../core/models/designation.models';
import { SiteListItem } from '../../../../core/models/sites.models';

export interface EmployeeRejoinDialogData {
  employee: EmployeeListItem;
}

@Component({
  selector: 'app-employee-rejoin-dialog',
  templateUrl: './employee-rejoin-dialog.component.html',
  styleUrl: './employee-rejoin-dialog.component.less',
})
export class EmployeeRejoinDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);
  private readonly designationService = inject(DesignationService);
  private readonly sitesService = inject(SitesService);
  private readonly notification = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<EmployeeRejoinDialogComponent>);
  readonly data = inject<EmployeeRejoinDialogData>(MAT_DIALOG_DATA);

  readonly saving = signal(false);
  readonly loading = signal(true);
  readonly departments = signal<DepartmentListItem[]>([]);
  readonly designations = signal<DesignationListItem[]>([]);
  readonly sites = signal<SiteListItem[]>([]);
  readonly selectedDepartmentId = signal('');
  private clientId = '';

  readonly departmentOptions = computed(() =>
    this.departments().map(d => ({ key: String(d.id), value: d.departmentName })),
  );

  readonly designationOptions = computed(() => {
    const departmentId = this.selectedDepartmentId();
    const placeholder = departmentId
      ? { key: '', value: 'Select designation' }
      : { key: '', value: 'Select department first' };
    return [
      placeholder,
      ...this.designations().map(d => ({ key: String(d.id), value: d.designationName })),
    ];
  });

  readonly siteOptions = computed(() => [
    { key: '', value: 'None' },
    ...this.sites().map(s => ({ key: String(s.id), value: s.siteName })),
  ]);

  readonly form = this.fb.group({
    joiningDate: [new Date(), Validators.required],
    departmentId: ['', Validators.required],
    designationId: ['', Validators.required],
    siteId: [''],
    reuseEmployeeCode: [true],
  });

  ngOnInit() {
    this.selectedDepartmentId.set(this.form.controls.departmentId.value ?? '');

    this.form.controls.departmentId.valueChanges.subscribe(departmentId => {
      this.selectedDepartmentId.set(departmentId ?? '');
      this.form.patchValue({ designationId: '' }, { emitEvent: false });
      this.loadDesignations(departmentId ?? '');
    });

    forkJoin({
      departments: this.departmentService.getAllForSelect(),
      sites: this.sitesService.getAllForSelect(),
      employee: this.employeeService.getById(this.data.employee.id),
    }).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: ({ departments, sites, employee }) => {
        this.clientId = employee.clientId ?? '';
        this.departments.set(departments.filter(d => d.id && d.departmentName));
        this.sites.set(sites.filter(s => s.id && s.siteName));
        this.form.patchValue({
          departmentId: employee.departmentId ?? '',
          siteId: employee.siteId ?? '',
        }, { emitEvent: false });
        this.selectedDepartmentId.set(employee.departmentId ?? '');

        if (employee.departmentId) {
          this.loadDesignations(employee.departmentId, employee.designationId ?? undefined);
        }
      },
      error: () => this.notification.error('Failed to load rejoin options.'),
    });
  }

  private loadDesignations(departmentId: string, preferredDesignationId?: string) {
    if (!departmentId) {
      this.designations.set([]);
      return;
    }

    this.designationService.getAllForSelect({
      clientId: this.clientId || undefined,
      departmentId,
      isActive: true,
    }).subscribe({
      next: items => {
        this.designations.set(items.filter(d => d.id && d.designationName));
        if (preferredDesignationId) {
          this.form.patchValue({ designationId: preferredDesignationId }, { emitEvent: false });
        }
      },
      error: () => this.designations.set([]),
    });
  }

  dateToSignetValue(date: Date | null | undefined): { startDate?: string } {
    if (!date) return {};
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return {};
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return { startDate: `${y}-${m}-${day}T00:00:00` };
  }

  signetValueToDate(value: { startDate?: string } | null | undefined): Date | null {
    if (!value?.startDate) return null;
    const datePart = value.startDate.split('T')[0];
    const [y, m, d] = datePart.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  onJoiningDateChange(value: { startDate?: string }) {
    const date = this.signetValueToDate(value);
    this.form.controls.joiningDate.setValue(date ?? new Date());
    this.form.controls.joiningDate.markAsTouched();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.saving.set(true);

    this.employeeService.rejoin(this.data.employee.id, {
      joiningDate: raw.joiningDate!.toISOString(),
      departmentId: raw.departmentId!,
      designationId: raw.designationId!,
      siteId: raw.siteId || undefined,
      reuseEmployeeCode: raw.reuseEmployeeCode ?? true,
    }).subscribe({
      next: () => {
        this.notification.success(`${this.data.employee.fullName} rejoined successfully.`);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving.set(false);
        const message = err?.error?.message ?? 'Failed to rejoin employee.';
        this.notification.error(message);
      },
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
