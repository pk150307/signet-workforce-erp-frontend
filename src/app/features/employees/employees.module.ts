import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { EmployeesModuleRoutingModule } from './employees-routing.module';
import { DocumentUploadComponent } from './components/document-upload/document-upload.component';
import { EmployeeAvatarComponent } from './components/employee-avatar/employee-avatar.component';
import { EmployeeCardComponent } from './components/employee-card/employee-card.component';
import { EmployeeMarkLeftDialogComponent } from './components/employee-mark-left-dialog/employee-mark-left-dialog.component';
import { EmployeeRejoinDialogComponent } from './components/employee-rejoin-dialog/employee-rejoin-dialog.component';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { EmployeeDetailComponent } from './employee-detail/employee-detail.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';

@NgModule({
  declarations: [
    DocumentUploadComponent,
    EmployeeAvatarComponent,
    EmployeeCardComponent,
    EmployeeMarkLeftDialogComponent,
    EmployeeRejoinDialogComponent,
    EmployeeDashboardComponent,
    EmployeeDetailComponent,
    EmployeeFormComponent,
    EmployeeListComponent,
  ],
  imports: [
    SharedModule,
    EmployeesModuleRoutingModule,
  ],
})
export class EmployeesModule {}
