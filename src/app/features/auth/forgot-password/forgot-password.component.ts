import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthLayoutComponent } from '../shared/auth-layout/auth-layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
@Component({
  selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.less',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  readonly router = inject(Router);

  readonly loading = signal(false);
  readonly submitted = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { email } = this.form.getRawValue();

    this.authService.forgotPassword({ email }).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.submitted.set(true);
        const message = err?.error?.detail || err?.error?.title;
        if (message) {
          this.notification.error(message);
        }
      },
    });
  }
}
