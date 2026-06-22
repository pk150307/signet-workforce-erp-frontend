import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
  },
  {
    path: 'roles',
    data: { breadcrumb: 'Roles' },
    loadComponent: () => import('./roles-list/roles-list.component').then(m => m.RolesListComponent),
  },
  {
    path: 'permissions',
    data: { breadcrumb: 'Permissions' },
    loadComponent: () => import('./permissions-list/permissions-list.component').then(m => m.PermissionsListComponent),
  },
  {
    path: 'users',
    data: { breadcrumb: 'Users' },
    loadComponent: () => import('./users-list/users-list.component').then(m => m.UsersListComponent),
  },
  {
    path: 'system-config',
    data: { breadcrumb: 'System Config' },
    loadComponent: () => import('./system-config/system-config.component').then(m => m.SystemConfigComponent),
  },
  {
    path: 'audit-logs',
    data: { breadcrumb: 'Audit Logs' },
    loadComponent: () => import('./audit-logs/audit-logs.component').then(m => m.AuditLogsComponent),
  },
  {
    path: 'email-templates',
    data: { breadcrumb: 'Email Templates' },
    loadComponent: () => import('./email-templates/email-templates.component').then(m => m.EmailTemplatesComponent),
  },
];
