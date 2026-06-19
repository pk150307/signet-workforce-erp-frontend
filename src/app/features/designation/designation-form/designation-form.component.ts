import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { DesignationService } from '../../../core/services/designation.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CreateDesignationRequest } from '../../../core/models/designation.models';

@Component({
  selector: 'app-designation-form',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './designation-form.component.html',
  styleUrl: './designation-form.component.less',
})
export class DesignationFormComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly designationService = inject(DesignationService);
  private readonly notification = inject(NotificationService);

  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly isEdit = signal(false);
  readonly gradeOptions = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'];
  private designationId: string | null = null;

  readonly form = this.fb.group({
    designationCode: ['', Validators.required],
    designationName: ['', Validators.required],
    parentDesignationId: [''],
    departmentId: [''],
    salaryGrade: ['G8', Validators.required],
    description: [''],
    isActive: [true],
  });

  ngOnInit() {
    this.designationId = this.route.snapshot.params['id'] ?? null;
    if (this.designationId) {
      this.isEdit.set(true);
      this.loading.set(true);
      this.designationService.getById(this.designationId).subscribe({
        next: (item) => {
          this.form.patchValue(item);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const payload = this.form.getRawValue() as CreateDesignationRequest;

    if (this.isEdit()) {
      this.designationService.update(this.designationId!, payload).subscribe({
        next: () => {
          this.notification.success('Designation saved.');
          this.router.navigate(['/designations']);
        },
        error: () => {
          this.notification.error('Failed to save designation.');
          this.saving.set(false);
        },
      });
      return;
    }

    this.designationService.create(payload).subscribe({
      next: () => {
        this.notification.success('Designation saved.');
        this.router.navigate(['/designations']);
      },
      error: () => {
        this.notification.error('Failed to save designation.');
        this.saving.set(false);
      },
    });
  }
}
