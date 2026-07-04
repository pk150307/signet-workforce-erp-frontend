import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DepartmentListComponent } from './department-list/department-list.component';
import { DepartmentFormComponent } from './department-form/department-form.component';
import { DepartmentDetailComponent } from './department-detail/department-detail.component';

const routes: Routes = [
  {
    path: '',
    component: DepartmentListComponent,
  },
  {
    path: 'new',
    data: { breadcrumb: 'Add Department' },
    component: DepartmentFormComponent,
  },
  {
    path: ':id/edit',
    data: { breadcrumb: 'Edit Department' },
    component: DepartmentFormComponent,
  },
  {
    path: ':id',
    data: { breadcrumb: 'Department Details' },
    component: DepartmentDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DepartmentModuleRoutingModule {}
