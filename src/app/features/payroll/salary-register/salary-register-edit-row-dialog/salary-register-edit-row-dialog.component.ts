import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  SalaryRegisterEmployeeRow,
  UpdateSalaryEmployeeRequest,
} from '../../../../core/models/salary-register.models';

export interface SalaryRegisterEditRowDialogData {
  row: SalaryRegisterEmployeeRow;
}

export type SalaryRegisterEditRowDialogResult = UpdateSalaryEmployeeRequest;

@Component({
  selector: 'app-salary-register-edit-row-dialog',
  templateUrl: './salary-register-edit-row-dialog.component.html',
  styleUrl: './salary-register-edit-row-dialog.component.less',
})
export class SalaryRegisterEditRowDialogComponent {
  readonly dialogRef = inject(
    MatDialogRef<SalaryRegisterEditRowDialogComponent, SalaryRegisterEditRowDialogResult>,
  );
  readonly data = inject<SalaryRegisterEditRowDialogData>(MAT_DIALOG_DATA);

  readonly form = new FormGroup({
    payDays: new FormControl(this.data.row.payDays, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    nAll: new FormControl(this.data.row.nAll, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    attAwAfd: new FormControl(this.data.row.attAwAfd, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.dialogRef.close({
      payDays: Number(value.payDays),
      nAll: Number(value.nAll),
      attAwAfd: Number(value.attAwAfd),
    });
  }
}
