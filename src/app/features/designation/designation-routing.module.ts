import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DesignationListComponent } from './designation-list/designation-list.component';
import { DesignationFormComponent } from './designation-form/designation-form.component';
import { DesignationDetailComponent } from './designation-detail/designation-detail.component';

const routes: Routes = [
  {
    path: '',
    component: DesignationListComponent,
  },
  {
    path: 'new',
    data: { breadcrumb: 'Add Designation' },
    component: DesignationFormComponent,
  },
  {
    path: ':id/edit',
    data: { breadcrumb: 'Edit Designation' },
    component: DesignationFormComponent,
  },
  {
    path: ':id',
    data: { breadcrumb: 'Designation Details' },
    component: DesignationDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DesignationModuleRoutingModule {}
