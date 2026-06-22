import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EmployeeService } from '../../../../core/services/employee.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { EMPLOYEE_LEFT_REASONS, EmployeeListItem } from '../../../../core/models/employee.models';

export interface EmployeeMarkLeftDialogData {
  employee: EmployeeListItem;
}

@Component({
  selector: 'app-employee-mark-left-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
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
  readonly reasons = EMPLOYEE_LEFT_REASONS;

  readonly form = this.fb.group({
    lastWorkingDate: [new Date(), Validators.required],
    reason: ['', Validators.required],
    remarks: [''],
  });

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
