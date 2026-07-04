import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { ConfirmDialogData } from '../../models/dialog.models';
@Component({
  selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.less',
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  get confirmButtonType(): 'primary' | 'error' {
    return this.data.confirmColor === 'warn' ? 'error' : 'primary';
  }

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
