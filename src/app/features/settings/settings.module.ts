import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { SettingsModuleRoutingModule } from './settings-routing.module';
import { AuditLogsComponent } from './audit-logs/audit-logs.component';
import { DeleteApprovalsListComponent } from './delete-approvals-list/delete-approvals-list.component';
import { EmailTemplatesComponent } from './email-templates/email-templates.component';
import { LoginHistoryListComponent } from './login-history-list/login-history-list.component';
import { PermissionsListComponent } from './permissions-list/permissions-list.component';
import { RejectRemarksDialogComponent } from './reject-remarks-dialog/reject-remarks-dialog.component';
import { RolePermissionsDrawerComponent } from './role-permissions-drawer/role-permissions-drawer.component';
import { RolesListComponent } from './roles-list/roles-list.component';
import { SettingsComponent } from './settings/settings.component';
import { SettingsSubnavComponent } from './shared/settings-subnav/settings-subnav.component';
import { SystemConfigComponent } from './system-config/system-config.component';
import { UserDrawerComponent } from './user-drawer/user-drawer.component';
import { UsersListComponent } from './users-list/users-list.component';

@NgModule({
  declarations: [
    AuditLogsComponent,
    DeleteApprovalsListComponent,
    EmailTemplatesComponent,
    LoginHistoryListComponent,
    PermissionsListComponent,
    RejectRemarksDialogComponent,
    RolePermissionsDrawerComponent,
    RolesListComponent,
    SettingsComponent,
    SettingsSubnavComponent,
    SystemConfigComponent,
    UserDrawerComponent,
    UsersListComponent,
  ],
  imports: [
    SharedModule,
    SettingsModuleRoutingModule,
  ],
})
export class SettingsModule {}
