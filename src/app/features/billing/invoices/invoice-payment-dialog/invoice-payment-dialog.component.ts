import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { DecimalPipe, NgFor, UpperCasePipe } from '@angular/common';
import { PAYMENT_MODES } from '../../../../core/models/billing.models';

export interface InvoicePaymentDialogData {
  invoiceId: string;
  balanceAmount: number;
}

@Component({
  selector: 'app-invoice-payment-dialog',
  standalone: true,
  imports: [
    NgFor, DecimalPipe, UpperCasePipe, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Record Payment</h2>
    <mat-dialog-content>
      <p>Outstanding balance: ₹{{ data.balanceAmount | number:'1.2-2' }}</p>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Payment Date</mat-label>
          <input matInput type="date" formControlName="paymentDate" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Amount</mat-label>
          <input matInput type="number" formControlName="amount" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Payment Mode</mat-label>
          <mat-select formControlName="paymentMode">
            <mat-option *ngFor="let mode of modes" [value]="mode">{{ mode | uppercase }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>UTR / Reference</mat-label>
          <input matInput formControlName="utrNumber" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Remarks</mat-label>
          <textarea matInput rows="2" formControlName="remarks"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" [mat-dialog-close]="form.getRawValue()">Record</button>
    </mat-dialog-actions>
  `,
  styles: ['.dialog-form { display: flex; flex-direction: column; gap: 8px; min-width: 320px; }'],
})
export class InvoicePaymentDialogComponent {
  readonly data = inject<InvoicePaymentDialogData>(MAT_DIALOG_DATA);
  readonly modes = PAYMENT_MODES;
  readonly form = new FormGroup({
    paymentDate: new FormControl(new Date().toISOString().slice(0, 10), { nonNullable: true, validators: Validators.required }),
    amount: new FormControl(this.data.balanceAmount, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }),
    paymentMode: new FormControl<'neft'>('neft', { nonNullable: true }),
    utrNumber: new FormControl(''),
    remarks: new FormControl(''),
  });
}
