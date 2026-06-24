import { Component, OnInit, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../core/services/auth.service';
import { IAM_PERMISSIONS } from '../../../core/constants/iam-permissions.constants';

interface SettingsCard {
  icon: string;
  title: string;
  description: string;
  route: string;
  color: string;
  visible: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NgFor, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.less',
})
export class SettingsComponent implements OnInit {
  private readonly authService = inject(AuthService);

  cards: SettingsCard[] = [];

  ngOnInit(): void {
    const can = (perm: string) =>
      this.authService.hasPermission(perm) || this.authService.hasRole('Super Admin');

    this.cards = [
      { icon: 'group', title: 'Users', description: 'Manage system users and assignments', route: '/settings/users', color: '#00796b', visible: can(IAM_PERMISSIONS.users.read) },
      { icon: 'admin_panel_settings', title: 'Roles', description: 'Manage user roles and access levels', route: '/settings/roles', color: '#1565C0', visible: can(IAM_PERMISSIONS.roles.read) },
      { icon: 'lock', title: 'Permission Matrix', description: 'View all module permissions', route: '/settings/permissions', color: '#512da8', visible: can(IAM_PERMISSIONS.roles.read) },
      { icon: 'delete_sweep', title: 'Delete Approvals', description: 'Review and approve delete requests', route: '/settings/delete-approvals', color: '#bf360c', visible: can(IAM_PERMISSIONS.deleteRequests.read) },
      { icon: 'login', title: 'Login History', description: 'View sign-in activity across users', route: '/settings/login-history', color: '#455a64', visible: can(IAM_PERMISSIONS.users.read) },
      { icon: 'history', title: 'Audit Logs', description: 'View system activity and changes', route: '/settings/audit-logs', color: '#c62828', visible: can(IAM_PERMISSIONS.audit.read) },
      { icon: 'tune', title: 'System Config', description: 'Company settings and preferences', route: '/settings/system-config', color: '#e65100', visible: true },
      { icon: 'email', title: 'Email Templates', description: 'Manage notification email templates', route: '/settings/email-templates', color: '#0277bd', visible: true },
    ].filter((card) => card.visible);
  }
}
