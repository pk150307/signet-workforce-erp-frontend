import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BranchListItem, OfficeListItem } from '../../../core/models/company.models';

export interface OfficeFormDialogData {
  office?: OfficeListItem | null;
  branches: BranchListItem[];
}

export interface OfficeFormResult {
  officeCode: string;
  officeName: string;
  branchId: string;
  branchName: string;
  floor: string;
  capacity: number;
  isActive: boolean;
}

@Component({
  selector: 'app-office-form-dialog',
  templateUrl: './office-form-dialog.component.html',
  styleUrl: './office-form-dialog.component.less',
})
export class OfficeFormDialogComponent {
  readonly data = inject<OfficeFormDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<OfficeFormDialogComponent, OfficeFormResult | undefined>);

  readonly isEdit = Boolean(this.data.office?.id);

  readonly branchOptions = this.data.branches.map(b => ({ key: b.id, value: b.branchName }));

  readonly statusOptions = [
    { key: 'true', value: 'Active' },
    { key: 'false', value: 'Inactive' },
  ];

  private readonly initialBranchId =
    this.data.branches.find(b => b.branchName === this.data.office?.branchName)?.id
    ?? this.data.branches[0]?.id
    ?? '';

  readonly form = new FormGroup({
    officeCode: new FormControl(this.data.office?.officeCode ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(20)],
    }),
    officeName: new FormControl(this.data.office?.officeName ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    branchId: new FormControl(this.initialBranchId, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    floor: new FormControl(this.data.office?.floor ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(40)],
    }),
    capacity: new FormControl(this.data.office?.capacity ?? 0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    isActive: new FormControl(this.data.office?.isActive === false ? 'false' : 'true', {
      nonNullable: true,
    }),
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const branch = this.data.branches.find(b => b.id === value.branchId);
    this.dialogRef.close({
      officeCode: value.officeCode.trim(),
      officeName: value.officeName.trim(),
      branchId: value.branchId,
      branchName: branch?.branchName ?? '',
      floor: value.floor.trim(),
      capacity: Number(value.capacity) || 0,
      isActive: value.isActive === 'true',
    });
  }
}
