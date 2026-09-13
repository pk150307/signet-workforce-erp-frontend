import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  EmployeeAdvanceDetail,
  EmployeeAdvanceEntry,
  EmployeeAdvancePayment,
  UpsertAdvancePaymentRequest,
} from '../../../../core/models/employee-advances.models';
import { EmployeeAdvancesService } from '../../../../core/services/employee-advances.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DatePickerPayload } from '../../../../library/data/date-picker-payload';

export interface EmployeeAdvancesPaymentsDialogData {
  registerId: string;
  month: number;
  year: number;
  row: EmployeeAdvanceEntry;
  canEdit: boolean;
}

export type EmployeeAdvancesPaymentsDialogResult = EmployeeAdvanceDetail;

@Component({
  selector: 'app-employee-advances-payments-dialog',
  templateUrl: './employee-advances-payments-dialog.component.html',
  styleUrl: './employee-advances-payments-dialog.component.less',
})
export class EmployeeAdvancesPaymentsDialogComponent {
  readonly dialogRef = inject(
    MatDialogRef<EmployeeAdvancesPaymentsDialogComponent, EmployeeAdvancesPaymentsDialogResult>,
  );
  readonly data = inject<EmployeeAdvancesPaymentsDialogData>(MAT_DIALOG_DATA);
  private readonly advancesService = inject(EmployeeAdvancesService);
  private readonly notification = inject(NotificationService);

  readonly busy = signal(false);
  readonly editingPaymentId = signal<string | null>(null);
  readonly entry = signal<EmployeeAdvanceEntry>(this.data.row);
  private latestDetail: EmployeeAdvanceDetail | null = null;

  readonly paidOnDatePickerConfig: Partial<DatePickerPayload> = {
    showTimeFields: false,
  };

  readonly form = new FormGroup({
    paidOn: new FormControl(this.defaultPaidOn(), {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)],
    }),
    amount: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
    notes: new FormControl('', { nonNullable: true }),
  });

  get payments(): EmployeeAdvancePayment[] {
    return this.entry().payments ?? [];
  }

  paidOnSignetValue(): { startDate?: string } {
    const raw = this.form.controls.paidOn.value;
    if (!raw) return {};
    return { startDate: `${raw}T00:00:00` };
  }

  onPaidOnChange(value: { startDate?: string }) {
    const datePart = value?.startDate?.split('T')[0] ?? '';
    this.form.controls.paidOn.setValue(datePart);
    this.form.controls.paidOn.markAsTouched();
  }

  cancelEdit() {
    this.editingPaymentId.set(null);
    this.form.reset({
      paidOn: this.defaultPaidOn(),
      amount: null,
      notes: '',
    });
  }

  startEdit(payment: EmployeeAdvancePayment) {
    if (!this.data.canEdit) return;
    this.editingPaymentId.set(payment.id);
    this.form.setValue({
      paidOn: payment.paidOn,
      amount: payment.amount,
      notes: payment.notes ?? '',
    });
  }

  submit() {
    if (!this.data.canEdit || this.form.invalid || this.busy()) return;
    const value = this.form.getRawValue();
    const body: UpsertAdvancePaymentRequest = {
      paidOn: String(value.paidOn).slice(0, 10),
      amount: Number(value.amount),
      notes: value.notes.trim() || null,
    };
    const paymentId = this.editingPaymentId();
    this.busy.set(true);

    const req$ = paymentId
      ? this.advancesService.updatePayment(this.data.registerId, this.data.row.id, paymentId, body)
      : this.advancesService.addPayment(this.data.registerId, this.data.row.id, body);

    req$.subscribe({
      next: (detail) => this.applyDetail(detail, true),
      error: (err) => {
        this.busy.set(false);
        this.notification.error(
          err?.error?.detail ?? err?.error?.message ?? 'Failed to save payment.',
        );
      },
    });
  }

  remove(payment: EmployeeAdvancePayment) {
    if (!this.data.canEdit || this.busy()) return;
    this.busy.set(true);
    this.advancesService.deletePayment(this.data.registerId, this.data.row.id, payment.id).subscribe({
      next: (detail) => this.applyDetail(detail, false),
      error: (err) => {
        this.busy.set(false);
        this.notification.error(
          err?.error?.detail ?? err?.error?.message ?? 'Failed to delete payment.',
        );
      },
    });
  }

  close() {
    this.dialogRef.close(this.latestDetail ?? undefined);
  }

  private applyDetail(detail: EmployeeAdvanceDetail, resetForm: boolean) {
    this.latestDetail = detail;
    const updated = detail.employees.find((e) => e.id === this.data.row.id);
    if (updated) this.entry.set(updated);
    this.busy.set(false);
    this.notification.success('Advance payments updated.');
    if (resetForm) this.cancelEdit();
  }

  private defaultPaidOn(): string {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
