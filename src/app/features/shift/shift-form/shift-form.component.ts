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

import { ShiftService } from '../../../core/services/shift.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CreateShiftRequest } from '../../../core/models/shift.models';

const WEEKLY_OFF_OPTIONS = [
  'Sunday',
  'Monday',
  'Saturday',
  'Saturday, Sunday',
  'Sunday, Monday',
];

import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({
  selector: 'app-shift-form',
  standalone: true,
  imports: [
    SkeletonLoaderComponent,
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
  templateUrl: './shift-form.component.html',
  styleUrl: './shift-form.component.less',
})
export class ShiftFormComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly shiftService = inject(ShiftService);
  private readonly notification = inject(NotificationService);

  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly isEdit = signal(false);
  readonly weeklyOffOptions = WEEKLY_OFF_OPTIONS;
  private shiftId: string | null = null;

  readonly form = this.fb.group({
    shiftCode: ['', Validators.required],
    shiftName: ['', Validators.required],
    startTime: ['09:00', Validators.required],
    endTime: ['18:00', Validators.required],
    breakMinutes: [60, [Validators.required, Validators.min(0)]],
    weeklyOff: ['Sunday', Validators.required],
    graceMinutes: [15, [Validators.min(0)]],
    isNightShift: [false],
    isActive: [true],
  });

  ngOnInit() {
    this.shiftId = this.route.snapshot.params['id'] ?? null;
    if (this.shiftId) {
      this.isEdit.set(true);
      this.loading.set(true);
      this.shiftService.getById(this.shiftId).subscribe({
        next: (shift) => {
          this.form.patchValue(shift);
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
    const payload = this.form.getRawValue() as CreateShiftRequest;

    if (this.isEdit()) {
      this.shiftService.update(this.shiftId!, payload).subscribe({
        next: () => {
          this.notification.success('Shift saved.');
          this.router.navigate(['/shifts']);
        },
        error: () => {
          this.notification.error('Failed to save shift.');
          this.saving.set(false);
        },
      });
      return;
    }

    this.shiftService.create(payload).subscribe({
      next: () => {
        this.notification.success('Shift saved.');
        this.router.navigate(['/shifts']);
      },
      error: () => {
        this.notification.error('Failed to save shift.');
        this.saving.set(false);
      },
    });
  }
}
