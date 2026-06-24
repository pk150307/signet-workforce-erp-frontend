import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface RejectRemarksDialogData {
  title: string;
  entityLabel?: string | null;
}

@Component({
  selector: 'app-reject-remarks-dialog',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p *ngIf="data.entityLabel">Rejecting delete request for <strong>{{ data.entityLabel }}</strong>.</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Rejection remarks</mat-label>
        <textarea matInput rows="4" [formControl]="remarksCtrl"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="warn" type="button" [disabled]="remarksCtrl.invalid" (click)="submit()">Reject</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    mat-dialog-content p { margin-top: 0; }
  `],
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
