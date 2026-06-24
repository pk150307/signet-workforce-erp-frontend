import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { IAM_PERMISSIONS } from '../../core/constants/iam-permissions.constants';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
  },
  {
    path: 'roles',
    data: { breadcrumb: 'Roles' },
    canActivate: [permissionGuard(IAM_PERMISSIONS.roles.read)],
    loadComponent: () => import('./roles-list/roles-list.component').then(m => m.RolesListComponent),
  },
  {
    path: 'permissions',
    data: { breadcrumb: 'Permissions' },
    canActivate: [permissionGuard(IAM_PERMISSIONS.roles.read)],
    loadComponent: () => import('./permissions-list/permissions-list.component').then(m => m.PermissionsListComponent),
  },
  {
    path: 'users',
    data: { breadcrumb: 'Users' },
    canActivate: [permissionGuard(IAM_PERMISSIONS.users.read)],
    loadComponent: () => import('./users-list/users-list.component').then(m => m.UsersListComponent),
  },
  {
    path: 'delete-approvals',
    data: { breadcrumb: 'Delete Approvals' },
    canActivate: [permissionGuard(IAM_PERMISSIONS.deleteRequests.read)],
    loadComponent: () => import('./delete-approvals-list/delete-approvals-list.component').then(m => m.DeleteApprovalsListComponent),
  },
  {
    path: 'login-history',
    data: { breadcrumb: 'Login History' },
    canActivate: [permissionGuard(IAM_PERMISSIONS.users.read)],
    loadComponent: () => import('./login-history-list/login-history-list.component').then(m => m.LoginHistoryListComponent),
  },
  {
    path: 'system-config',
    data: { breadcrumb: 'System Config' },
    loadComponent: () => import('./system-config/system-config.component').then(m => m.SystemConfigComponent),
  },
  {
    path: 'audit-logs',
    data: { breadcrumb: 'Audit Logs' },
    canActivate: [permissionGuard(IAM_PERMISSIONS.audit.read)],
    loadComponent: () => import('./audit-logs/audit-logs.component').then(m => m.AuditLogsComponent),
  },
  {
    path: 'email-templates',
    data: { breadcrumb: 'Email Templates' },
    loadComponent: () => import('./email-templates/email-templates.component').then(m => m.EmailTemplatesComponent),
  },
];
