import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthLayoutComponent } from '../shared/auth-layout/auth-layout.component';
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
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthLayoutComponent,
    PasswordStrengthComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.less',
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly hidePassword = signal(true);
  readonly token = signal('');

  readonly form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, passwordPolicyValidator]],
      confirmPassword: ['', Validators.required],
    },
    {
      validators: (g: AbstractControl) =>
        g.get('password')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true },
    },
  );

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.token.set(token);
  }

  onSubmit() {
    if (!this.token()) {
      this.notification.error('Invalid or missing reset token.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { password, confirmPassword } = this.form.getRawValue();

    this.authService.resetPassword({
      token: this.token(),
      newPassword: password,
      confirmPassword,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err?.error?.detail || err?.error?.title || 'Unable to reset password.';
        this.notification.error(message);
      },
    });
  }
}
