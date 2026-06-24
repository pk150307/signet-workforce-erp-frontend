import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface DeleteReasonDialogData {
  title: string;
  entityLabel: string;
  message?: string;
}

@Component({
  selector: 'app-delete-reason-dialog',
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
      <p *ngIf="data.message">{{ data.message }}</p>
      <p *ngIf="!data.message">
        Deleting <strong>{{ data.entityLabel }}</strong> requires Super Admin approval.
        Please provide a reason.
      </p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Delete reason</mat-label>
        <textarea matInput rows="4" [formControl]="reasonCtrl"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="warn" type="button" [disabled]="reasonCtrl.invalid" (click)="submit()">
        Submit Request
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    mat-dialog-content p { margin-top: 0; }
  `],
})
export class DeleteReasonDialogComponent {
  readonly data = inject<DeleteReasonDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DeleteReasonDialogComponent>);
  readonly reasonCtrl = new FormControl('', [Validators.required, Validators.minLength(3)]);

  submit(): void {
    if (this.reasonCtrl.invalid) return;
    this.dialogRef.close(this.reasonCtrl.value?.trim());
  }
}
