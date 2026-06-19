import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { DepartmentService } from '../../../core/services/department.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CreateDepartmentRequest } from '../../../core/models/department.models';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './department-form.component.html',
  styleUrl: './department-form.component.less',
})
export class DepartmentFormComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly departmentService = inject(DepartmentService);
  private readonly notification = inject(NotificationService);

  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly isEdit = signal(false);
  private departmentId: string | null = null;

  readonly form = this.fb.group({
    departmentCode: ['', Validators.required],
    departmentName: ['', Validators.required],
    parentDepartmentId: [''],
    description: [''],
    isActive: [true],
  });

  ngOnInit() {
    this.departmentId = this.route.snapshot.params['id'] ?? null;
    if (this.departmentId) {
      this.isEdit.set(true);
      this.loading.set(true);
      this.departmentService.getById(this.departmentId).subscribe({
        next: (dept) => {
          this.form.patchValue(dept);
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
    const payload = this.form.getRawValue() as CreateDepartmentRequest;

    if (this.isEdit()) {
      this.departmentService.update(this.departmentId!, payload).subscribe({
        next: () => {
          this.notification.success('Department saved.');
          this.router.navigate(['/departments']);
        },
        error: () => {
          this.notification.error('Failed to save department.');
          this.saving.set(false);
        },
      });
      return;
    }

    this.departmentService.create(payload).subscribe({
      next: () => {
        this.notification.success('Department saved.');
        this.router.navigate(['/departments']);
      },
      error: () => {
        this.notification.error('Failed to save department.');
        this.saving.set(false);
      },
    });
  }
}
