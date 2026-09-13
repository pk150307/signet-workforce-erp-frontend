import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

export interface SalaryRegisterReopenDialogResult {
  reason: string;
}

@Component({
  selector: 'app-salary-register-reopen-dialog',
  templateUrl: './salary-register-reopen-dialog.component.html',
  styleUrl: './salary-register-reopen-dialog.component.less',
})
export class SalaryRegisterReopenDialogComponent {
  readonly dialogRef = inject(
    MatDialogRef<SalaryRegisterReopenDialogComponent, SalaryRegisterReopenDialogResult>,
  );

  readonly form = new FormGroup({
    reason: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close({ reason: this.form.getRawValue().reason.trim() });
  }
}
