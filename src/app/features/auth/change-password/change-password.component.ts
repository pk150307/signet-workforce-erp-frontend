import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { PasswordStrengthComponent } from '../shared/password-strength/password-strength.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { evaluatePasswordPolicy } from '../../../core/utils/password-policy.util';

function passwordPolicyValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '');
  if (!value) return null;
  return evaluatePasswordPolicy(value).valid ? null : { passwordPolicy: true };
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PasswordStrengthComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.less',
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly hideNewPassword = signal(true);

  readonly form = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, passwordPolicyValidator]],
      confirmPassword: ['', Validators.required],
    },
    {
      validators: (g: AbstractControl) =>
        g.get('newPassword')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true },
    },
  );

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.form.getRawValue();
    if (currentPassword === newPassword) {
      this.notification.error('New password must be different from the current password.');
      return;
    }

    this.loading.set(true);
    this.authService.changePassword({ currentPassword, newPassword, confirmPassword }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.notification.success(res.message || 'Password changed successfully.');
        this.form.reset();
        if (this.authService.currentUser()?.forcePasswordReset) {
          this.authService.logout();
          return;
        }
        void this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err?.error?.detail || err?.error?.title || 'Unable to change password.';
        this.notification.error(message);
      },
    });
  }
}
