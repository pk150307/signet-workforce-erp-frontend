import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { UsersService } from '../../../core/services/users.service';
import { RolesService } from '../../../core/services/roles.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { IAM_PERMISSIONS } from '../../../core/constants/iam-permissions.constants';
import { IamRoleListItem, IamUserDetail } from '../../../core/models/iam.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-user-drawer',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    SkeletonLoaderComponent,
  ],
  templateUrl: './user-drawer.component.html',
  styleUrl: './user-drawer.component.less',
})
export class UserDrawerComponent implements OnChanges {
  @Input() userId: string | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly usersService = inject(UsersService);
  private readonly rolesService = inject(RolesService);
  private readonly notification = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly roles = signal<IamRoleListItem[]>([]);
  readonly detail = signal<IamUserDetail | null>(null);

  readonly canCreate = this.authService.hasPermission(IAM_PERMISSIONS.users.create);
  readonly canUpdate = this.authService.hasPermission(IAM_PERMISSIONS.users.update);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    mobile: [''],
    roleIds: [[] as string[], Validators.required],
    isActive: [true],
    forcePasswordReset: [true],
  });

  get isEditMode(): boolean {
    return Boolean(this.userId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId']) {
      this.loadRoles();
      if (this.userId) {
        this.loadUser();
      } else {
        this.detail.set(null);
        this.form.reset({
          email: '',
          firstName: '',
          lastName: '',
          mobile: '',
          roleIds: [],
          isActive: true,
          forcePasswordReset: true,
        });
      }
    }
  }

  loadRoles(): void {
    this.rolesService.list({ page: 1, pageSize: 100, isActive: true }).subscribe({
      next: (result) => this.roles.set(result.items),
      error: () => this.notification.error('Failed to load roles.'),
    });
  }

  loadUser(): void {
    if (!this.userId) return;
    this.loading.set(true);
    this.usersService.getById(this.userId).subscribe({
      next: (user) => {
        this.detail.set(user);
        this.form.patchValue({
          email: user.email,
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          mobile: user.mobile ?? '',
          roleIds: user.roleIds,
          isActive: user.isActive,
          forcePasswordReset: user.forcePasswordReset,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load user.');
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();

    if (this.isEditMode && this.userId) {
      this.usersService.update(this.userId, {
        email: value.email,
        firstName: value.firstName,
        lastName: value.lastName,
        mobile: value.mobile || null,
        roleIds: value.roleIds,
        isActive: value.isActive,
      }).subscribe({
        next: () => {
          this.saving.set(false);
          this.notification.success('User updated successfully.');
          this.saved.emit();
        },
        error: (err) => {
          this.saving.set(false);
          this.notification.error(err?.error?.message ?? 'Failed to update user.');
        },
      });
      return;
    }

    this.usersService.create({
      email: value.email,
      firstName: value.firstName,
      lastName: value.lastName,
      mobile: value.mobile || null,
      roleIds: value.roleIds,
      isActive: value.isActive,
      forcePasswordReset: value.forcePasswordReset,
    }).subscribe({
      next: (res) => {
        this.saving.set(false);
        const msg = res.temporaryPassword
          ? `User created. Temporary password: ${res.temporaryPassword}`
          : 'User created successfully.';
        this.notification.success(msg);
        this.saved.emit();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err?.error?.message ?? 'Failed to create user.');
      },
    });
  }

  close(): void {
    this.closed.emit();
  }
}
