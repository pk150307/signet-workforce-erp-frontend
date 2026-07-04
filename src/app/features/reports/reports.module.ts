import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ReportsModuleRoutingModule } from './reports-routing.module';
import { AttendanceReportComponent } from './attendance-report/attendance-report.component';
import { EmployeeReportComponent } from './employee-report/employee-report.component';
import { InvoiceReportComponent } from './invoice-report/invoice-report.component';
import { PayrollReportComponent } from './payroll-report/payroll-report.component';
import { ReportsHubComponent } from './reports-hub/reports-hub.component';

@NgModule({
  declarations: [
    AttendanceReportComponent,
    EmployeeReportComponent,
    InvoiceReportComponent,
    PayrollReportComponent,
    ReportsHubComponent,
  ],
  imports: [
    SharedModule,
    ReportsModuleRoutingModule,
  ],
})
export class ReportsModule {}
