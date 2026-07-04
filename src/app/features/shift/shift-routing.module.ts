import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShiftListComponent } from './shift-list/shift-list.component';
import { ShiftFormComponent } from './shift-form/shift-form.component';
import { ShiftAssignComponent } from './shift-assign/shift-assign.component';

const routes: Routes = [
  {
    path: '',
    component: ShiftListComponent,
  },
  {
    path: 'new',
    data: { breadcrumb: 'Add Shift' },
    component: ShiftFormComponent,
  },
  {
    path: 'assign',
    data: { breadcrumb: 'Assign Shift' },
    component: ShiftAssignComponent,
  },
  {
    path: ':id/edit',
    data: { breadcrumb: 'Edit Shift' },
    component: ShiftFormComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShiftModuleRoutingModule {}
