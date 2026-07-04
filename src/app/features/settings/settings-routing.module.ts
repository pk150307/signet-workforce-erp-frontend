import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { IAM_PERMISSIONS } from '../../core/constants/iam-permissions.constants';
import { SettingsComponent } from './settings/settings.component';
import { RolesListComponent } from './roles-list/roles-list.component';
import { PermissionsListComponent } from './permissions-list/permissions-list.component';
import { UsersListComponent } from './users-list/users-list.component';
import { DeleteApprovalsListComponent } from './delete-approvals-list/delete-approvals-list.component';
import { LoginHistoryListComponent } from './login-history-list/login-history-list.component';
import { SystemConfigComponent } from './system-config/system-config.component';
import { AuditLogsComponent } from './audit-logs/audit-logs.component';
import { EmailTemplatesComponent } from './email-templates/email-templates.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
  },
  {
    path: 'roles',
    data: { breadcrumb: 'Roles' },
    canActivate: [permissionGuard(IAM_PERMISSIONS.roles.read)],
    component: RolesListComponent,
  },
  {
    path: 'permissions',
    data: { breadcrumb: 'Permissions' },
    canActivate: [permissionGuard(IAM_PERMISSIONS.roles.read)],
    component: PermissionsListComponent,
  },
  {
    path: 'users',
    data: { breadcrumb: 'Users' },
    canActivate: [permissionGuard(IAM_PERMISSIONS.users.read)],
    component: UsersListComponent,
  },
  {
    path: 'delete-approvals',
    data: { breadcrumb: 'Delete Approvals' },
    canActivate: [permissionGuard(IAM_PERMISSIONS.deleteRequests.read)],
    component: DeleteApprovalsListComponent,
  },
  {
    path: 'login-history',
    data: { breadcrumb: 'Login History' },
    canActivate: [permissionGuard(IAM_PERMISSIONS.users.read)],
    component: LoginHistoryListComponent,
  },
  {
    path: 'system-config',
    data: { breadcrumb: 'System Config' },
    component: SystemConfigComponent,
  },
  {
    path: 'audit-logs',
    data: { breadcrumb: 'Audit Logs' },
    canActivate: [permissionGuard(IAM_PERMISSIONS.audit.read)],
    component: AuditLogsComponent,
  },
  {
    path: 'email-templates',
    data: { breadcrumb: 'Email Templates' },
    component: EmailTemplatesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsModuleRoutingModule {}
