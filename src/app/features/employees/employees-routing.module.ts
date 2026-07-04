import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { EmployeeDetailComponent } from './employee-detail/employee-detail.component';

const routes: Routes = [
  {
    path: '',
    component: EmployeeDashboardComponent,
  },
  {
    path: 'list',
    data: { breadcrumb: 'All Employees' },
    component: EmployeeListComponent,
  },
  {
    path: 'new',
    data: { breadcrumb: 'Add Employee' },
    component: EmployeeFormComponent,
  },
  {
    path: ':id',
    data: { breadcrumb: 'Employee Profile' },
    component: EmployeeDetailComponent,
  },
  {
    path: ':id/edit',
    data: { breadcrumb: 'Edit Employee' },
    component: EmployeeFormComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeesModuleRoutingModule {}
