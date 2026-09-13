import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendanceEmployeeListComponent } from './attendance-employee-list/attendance-employee-list.component';
import { AttendanceRegisterComponent } from './attendance-register/attendance-register.component';

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
    redirectTo: 'register',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AttendanceModuleRoutingModule {}
