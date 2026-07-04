import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendanceEmployeeListComponent } from './attendance-employee-list/attendance-employee-list.component';
import { AttendanceRegisterComponent } from './attendance-register/attendance-register.component';
import { AttendanceEmployeeDetailComponent } from './attendance-employee-detail/attendance-employee-detail.component';

const routes: Routes = [
  {
    path: '',
    component: AttendanceEmployeeListComponent,
  },
  {
    path: 'register',
    data: { breadcrumb: 'Register Entry' },
    component: AttendanceRegisterComponent,
  },
  {
    path: 'employees/:id',
    data: { breadcrumb: 'Employee Calendar' },
    component: AttendanceEmployeeDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AttendanceModuleRoutingModule {}
