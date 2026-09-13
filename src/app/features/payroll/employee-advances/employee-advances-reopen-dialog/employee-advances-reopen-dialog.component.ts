import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

export interface EmployeeAdvancesReopenDialogResult {
  reason: string;
}

@Component({
  selector: 'app-employee-advances-reopen-dialog',
  templateUrl: './employee-advances-reopen-dialog.component.html',
  styleUrl: './employee-advances-reopen-dialog.component.less',
})
export class EmployeeAdvancesReopenDialogComponent {
  readonly dialogRef = inject(
    MatDialogRef<EmployeeAdvancesReopenDialogComponent, EmployeeAdvancesReopenDialogResult>,
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
