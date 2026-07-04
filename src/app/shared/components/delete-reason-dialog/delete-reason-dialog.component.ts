import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DeleteReasonDialogData {
  title: string;
  entityLabel: string;
  message?: string;
}

@Component({
  selector: 'app-delete-reason-dialog',
  templateUrl: './delete-reason-dialog.component.html',
  styleUrl: './delete-reason-dialog.component.less',
})
export class DeleteReasonDialogComponent {
  private readonly fb = inject(FormBuilder);

  readonly data = inject<DeleteReasonDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DeleteReasonDialogComponent>);

  readonly form = this.fb.nonNullable.group({
    reason: ['', [Validators.required, Validators.minLength(3)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.getRawValue().reason.trim());
  }
}
