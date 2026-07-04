import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsHubComponent } from './reports-hub/reports-hub.component';
import { AttendanceReportComponent } from './attendance-report/attendance-report.component';
import { PayrollReportComponent } from './payroll-report/payroll-report.component';
import { InvoiceReportComponent } from './invoice-report/invoice-report.component';
import { EmployeeReportComponent } from './employee-report/employee-report.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsHubComponent,
  },
  {
    path: 'attendance',
    data: { breadcrumb: 'Attendance Report' },
    component: AttendanceReportComponent,
  },
  {
    path: 'payroll',
    data: { breadcrumb: 'Payroll Report' },
    component: PayrollReportComponent,
  },
  {
    path: 'invoices',
    data: { breadcrumb: 'Invoice Report' },
    component: InvoiceReportComponent,
  },
  {
    path: 'employees',
    data: { breadcrumb: 'Employee Report' },
    component: EmployeeReportComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsModuleRoutingModule {}
