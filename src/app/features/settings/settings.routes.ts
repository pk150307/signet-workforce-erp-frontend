import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
  },
  {
    path: 'roles',
    loadComponent: () => import('./roles-list/roles-list.component').then(m => m.RolesListComponent),
  },
  {
    path: 'permissions',
    loadComponent: () => import('./permissions-list/permissions-list.component').then(m => m.PermissionsListComponent),
  },
  {
    path: 'users',
    loadComponent: () => import('./users-list/users-list.component').then(m => m.UsersListComponent),
  },
  {
    path: 'system-config',
    loadComponent: () => import('./system-config/system-config.component').then(m => m.SystemConfigComponent),
  },
  {
    path: 'audit-logs',
    loadComponent: () => import('./audit-logs/audit-logs.component').then(m => m.AuditLogsComponent),
  },
  {
    path: 'email-templates',
    loadComponent: () => import('./email-templates/email-templates.component').then(m => m.EmailTemplatesComponent),
  },
];
