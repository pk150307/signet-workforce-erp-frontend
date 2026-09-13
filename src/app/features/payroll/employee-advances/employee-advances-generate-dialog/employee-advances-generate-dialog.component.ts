import { Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClientListItem } from '../../../../core/models/client.models';
import { GenerateEmployeeAdvanceRequest } from '../../../../core/models/employee-advances.models';
import { EMPLOYEE_ADVANCE_MONTHS } from '../employee-advances.constants';

export interface EmployeeAdvancesGenerateDialogData {
  clientId: string | null;
  month: number;
  year: number;
  clients: ClientListItem[];
}

export type EmployeeAdvancesGenerateDialogResult = GenerateEmployeeAdvanceRequest;

@Component({
  selector: 'app-employee-advances-generate-dialog',
  templateUrl: './employee-advances-generate-dialog.component.html',
  styleUrl: './employee-advances-generate-dialog.component.less',
})
export class EmployeeAdvancesGenerateDialogComponent {
  readonly dialogRef = inject(
    MatDialogRef<EmployeeAdvancesGenerateDialogComponent, EmployeeAdvancesGenerateDialogResult>,
  );
  readonly data = inject<EmployeeAdvancesGenerateDialogData>(MAT_DIALOG_DATA);

  readonly years = [this.data.year - 1, this.data.year, this.data.year + 1];
  readonly monthOptions = computed(() =>
    EMPLOYEE_ADVANCE_MONTHS.map(m => ({ key: String(m.value), value: m.label })),
  );
  readonly yearOptions = computed(() => this.years.map(y => ({ key: String(y), value: String(y) })));
  readonly clientOptions = computed(() =>
    this.data.clients.map(c => ({ key: String(c.id), value: c.companyName })),
  );

  readonly form = new FormGroup({
    clientId: new FormControl(this.data.clientId || '', {
      nonNullable: true,
      validators: Validators.required,
    }),
    month: new FormControl(this.data.month, { nonNullable: true, validators: Validators.required }),
    year: new FormControl(this.data.year, { nonNullable: true, validators: Validators.required }),
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { clientId, month, year } = this.form.getRawValue();
    this.dialogRef.close({ clientId, month: Number(month), year: Number(year) });
  }
}
