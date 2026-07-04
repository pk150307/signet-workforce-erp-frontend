import { Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PAYMENT_MODES } from '../../../../core/models/billing.models';

export interface InvoicePaymentDialogData {
  invoiceId: string;
  balanceAmount: number;
}

@Component({
  selector: 'app-invoice-payment-dialog',
  templateUrl: './invoice-payment-dialog.component.html',
  styleUrl: './invoice-payment-dialog.component.less',
})
export class InvoicePaymentDialogComponent {
  readonly dialogRef = inject(MatDialogRef<InvoicePaymentDialogComponent>);
  readonly data = inject<InvoicePaymentDialogData>(MAT_DIALOG_DATA);
  readonly modes = PAYMENT_MODES;
  readonly paymentModeOptions = computed(() =>
    this.modes.map(mode => ({ key: mode, value: mode.toUpperCase() })),
  );
  readonly form = new FormGroup({
    paymentDate: new FormControl(new Date().toISOString().slice(0, 10), { nonNullable: true, validators: Validators.required }),
    amount: new FormControl(this.data.balanceAmount, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }),
    paymentMode: new FormControl<'neft'>('neft', { nonNullable: true }),
    utrNumber: new FormControl(''),
    remarks: new FormControl(''),
  });
}
