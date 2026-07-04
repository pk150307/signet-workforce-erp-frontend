import { Component, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface RejectRemarksDialogData {
  title: string;
  entityLabel?: string | null;
}

@Component({
  selector: 'app-reject-remarks-dialog',
  templateUrl: './reject-remarks-dialog.component.html',
  styleUrl: './reject-remarks-dialog.component.less',
})
export class RejectRemarksDialogComponent {
  readonly data = inject<RejectRemarksDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<RejectRemarksDialogComponent>);
  readonly remarksCtrl = new FormControl('', [Validators.required, Validators.minLength(3)]);

  submit(): void {
    if (this.remarksCtrl.invalid) return;
    this.dialogRef.close(this.remarksCtrl.value?.trim());
  }
}
