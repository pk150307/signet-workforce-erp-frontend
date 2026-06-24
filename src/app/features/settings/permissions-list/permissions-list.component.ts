import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { RolesService } from '../../../core/services/roles.service';
import { NotificationService } from '../../../core/services/notification.service';
import { IamPermissionModuleGroup } from '../../../core/models/iam.models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-permissions-list',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    EmptyStateComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './permissions-list.component.html',
  styleUrl: './permissions-list.component.less',
})
export class PermissionsListComponent implements OnInit {
  private readonly rolesService = inject(RolesService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(true);
  readonly groups = signal<IamPermissionModuleGroup[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.rolesService.listPermissions(true).subscribe({
      next: (result) => {
        this.groups.set(result as IamPermissionModuleGroup[]);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notification.error(err?.error?.message ?? 'Failed to load permissions.');
      },
    });
  }
}
