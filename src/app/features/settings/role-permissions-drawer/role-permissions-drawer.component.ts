import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RolesService } from '../../../core/services/roles.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { IAM_PERMISSIONS } from '../../../core/constants/iam-permissions.constants';
import { IamPermissionModuleGroup, IamRoleDetail } from '../../../core/models/iam.models';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-role-permissions-drawer',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    SkeletonLoaderComponent,
  ],
  templateUrl: './role-permissions-drawer.component.html',
  styleUrl: './role-permissions-drawer.component.less',
})
export class RolePermissionsDrawerComponent implements OnChanges {
  @Input({ required: true }) roleId!: string;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly rolesService = inject(RolesService);
  private readonly notification = inject(NotificationService);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly role = signal<IamRoleDetail | null>(null);
  readonly groups = signal<IamPermissionModuleGroup[]>([]);
  readonly selected = signal<Set<string>>(new Set());

  readonly canUpdate = this.authService.hasPermission(IAM_PERMISSIONS.roles.update);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['roleId'] && this.roleId) {
      this.load();
    }
  }

  load(): void {
    this.loading.set(true);
    this.rolesService.getById(this.roleId).subscribe({
      next: (role) => {
        this.role.set(role);
        this.selected.set(new Set(role.permissionIds));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load role.');
      },
    });

    this.rolesService.listPermissions(true).subscribe({
      next: (result) => this.groups.set(result as IamPermissionModuleGroup[]),
      error: () => this.notification.error('Failed to load permissions.'),
    });
  }

  isChecked(id: string): boolean {
    return this.selected().has(id);
  }

  toggle(id: string, checked: boolean): void {
    const next = new Set(this.selected());
    if (checked) next.add(id);
    else next.delete(id);
    this.selected.set(next);
  }

  toggleModule(group: IamPermissionModuleGroup, checked: boolean): void {
    const next = new Set(this.selected());
    for (const p of group.permissions) {
      if (checked) next.add(p.id);
      else next.delete(p.id);
    }
    this.selected.set(next);
  }

  moduleAllSelected(group: IamPermissionModuleGroup): boolean {
    return group.permissions.every((p) => this.selected().has(p.id));
  }

  save(): void {
    if (!this.canUpdate) return;
    this.saving.set(true);
    this.rolesService.updatePermissions(this.roleId, Array.from(this.selected())).subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.success('Role permissions updated.');
        this.saved.emit();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err?.error?.message ?? 'Failed to update permissions.');
      },
    });
  }

  close(): void {
    this.closed.emit();
  }
}
