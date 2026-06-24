import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DEFAULT_COMPANY_LOGO } from '../../../core/constants/company.constants';
import { environment } from '@env/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.less',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(false);
  readonly hidePassword = signal(true);
  readonly year = new Date().getFullYear();
  readonly appName = environment.appName;
  readonly appVersion = environment.appVersion;
  readonly logoUrl = DEFAULT_COMPANY_LOGO;

  readonly stats = [
    { value: 'Multi-site', label: 'Centralised ops' },
    { value: 'Statutory', label: 'PF · ESIC · GST' },
    { value: 'Real-time', label: 'Live attendance' },
  ];

  readonly features = [
    { icon: 'groups', title: 'Workforce', desc: 'Employees, sites & org chart' },
    { icon: 'schedule', title: 'Attendance', desc: 'Shifts, leave & registers' },
    { icon: 'payments', title: 'Payroll', desc: 'Payslips & compliance' },
    { icon: 'receipt_long', title: 'Billing', desc: 'Invoices & client sites' },
  ];

  private returnUrl = '/dashboard';

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { email, password, rememberMe } = this.form.getRawValue();

    this.authService.login({ email, password, rememberMe }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.forcePasswordReset) {
          void this.router.navigate(['/auth/change-password']);
          return;
        }
        void this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err?.error?.title || err?.error?.detail || 'Invalid email or password.';
        this.notification.error(message);
      },
    });
  }
}
