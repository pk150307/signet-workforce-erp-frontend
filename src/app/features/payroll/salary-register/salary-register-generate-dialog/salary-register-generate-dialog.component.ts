import { Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClientListItem } from '../../../../core/models/client.models';
import { GenerateSalaryRegisterRequest } from '../../../../core/models/salary-register.models';
import { SALARY_REGISTER_MONTHS } from '../salary-register.constants';

export interface SalaryRegisterGenerateDialogData {
  clientId: string | null;
  month: number;
  year: number;
  clients: ClientListItem[];
}

export type SalaryRegisterGenerateDialogResult = GenerateSalaryRegisterRequest;

@Component({
  selector: 'app-salary-register-generate-dialog',
  templateUrl: './salary-register-generate-dialog.component.html',
  styleUrl: './salary-register-generate-dialog.component.less',
})
export class SalaryRegisterGenerateDialogComponent {
  readonly dialogRef = inject(MatDialogRef<SalaryRegisterGenerateDialogComponent, SalaryRegisterGenerateDialogResult>);
  readonly data = inject<SalaryRegisterGenerateDialogData>(MAT_DIALOG_DATA);

  readonly years = this.buildYearOptions(this.data.year);

  readonly monthOptions = computed(() =>
    SALARY_REGISTER_MONTHS.map(m => ({ key: String(m.value), value: m.label })),
  );

  readonly yearOptions = computed(() =>
    this.years.map(y => ({ key: String(y), value: String(y) })),
  );

  readonly clientOptions = computed(() =>
    this.data.clients.map(c => ({ key: String(c.id), value: c.companyName })),
  );

  readonly form = new FormGroup({
    clientId: new FormControl(this.data.clientId || '', {
      nonNullable: true,
      validators: Validators.required,
    }),
    month: new FormControl(this.data.month, {
      nonNullable: true,
      validators: Validators.required,
    }),
    year: new FormControl(this.data.year, {
      nonNullable: true,
      validators: Validators.required,
    }),
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { clientId, month, year } = this.form.getRawValue();
    this.dialogRef.close({ clientId, month: Number(month), year: Number(year) });
  }

  private buildYearOptions(current: number): number[] {
    return [current - 1, current, current + 1];
  }
}
