import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BranchListItem } from '../../../core/models/company.models';

export interface BranchFormDialogData {
  branch?: BranchListItem | null;
}

export interface BranchFormResult {
  branchCode: string;
  branchName: string;
  city: string;
  state: string;
  isActive: boolean;
}

@Component({
  selector: 'app-branch-form-dialog',
  templateUrl: './branch-form-dialog.component.html',
  styleUrl: './branch-form-dialog.component.less',
})
export class BranchFormDialogComponent {
  readonly data = inject<BranchFormDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<BranchFormDialogComponent, BranchFormResult | undefined>);

  readonly isEdit = Boolean(this.data.branch?.id);

  readonly form = new FormGroup({
    branchCode: new FormControl(this.data.branch?.branchCode ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(20)],
    }),
    branchName: new FormControl(this.data.branch?.branchName ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    city: new FormControl(this.data.branch?.city ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(80)],
    }),
    state: new FormControl(this.data.branch?.state ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(80)],
    }),
    isActive: new FormControl(this.data.branch?.isActive === false ? 'false' : 'true', {
      nonNullable: true,
    }),
  });

  readonly statusOptions = [
    { key: 'true', value: 'Active' },
    { key: 'false', value: 'Inactive' },
  ];

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.dialogRef.close({
      branchCode: value.branchCode.trim(),
      branchName: value.branchName.trim(),
      city: value.city.trim(),
      state: value.state.trim(),
      isActive: value.isActive === 'true',
    });
  }
}
