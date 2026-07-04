import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { EmployeeService } from '../../../../core/services/employee.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { EMPLOYEE_LEFT_REASONS, EmployeeListItem } from '../../../../core/models/employee.models';

export interface EmployeeMarkLeftDialogData {
  employee: EmployeeListItem;
}

@Component({
  selector: 'app-employee-mark-left-dialog',
  templateUrl: './employee-mark-left-dialog.component.html',
  styleUrl: './employee-mark-left-dialog.component.less',
})
export class EmployeeMarkLeftDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly notification = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<EmployeeMarkLeftDialogComponent>);
  readonly data = inject<EmployeeMarkLeftDialogData>(MAT_DIALOG_DATA);

  readonly saving = signal(false);
  readonly reasonOptions = computed(() =>
    EMPLOYEE_LEFT_REASONS.map(reason => ({ key: reason, value: reason })),
  );

  readonly form = this.fb.group({
    lastWorkingDate: [new Date(), Validators.required],
    reason: ['', Validators.required],
    remarks: [''],
  });

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

  onLastWorkingDateChange(value: { startDate?: string }) {
    const date = this.signetValueToDate(value);
    this.form.controls.lastWorkingDate.setValue(date ?? new Date());
    this.form.controls.lastWorkingDate.markAsTouched();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const lastWorkingDate = raw.lastWorkingDate!;
    this.saving.set(true);

    this.employeeService.markLeft(this.data.employee.id, {
      lastWorkingDate: lastWorkingDate.toISOString(),
      reason: raw.reason!.trim(),
      remarks: raw.remarks?.trim() || undefined,
    }).subscribe({
      next: () => {
        this.notification.success(`${this.data.employee.fullName} marked as left.`);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving.set(false);
        const message = err?.error?.message ?? 'Failed to mark employee as left.';
        this.notification.error(message);
      },
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
