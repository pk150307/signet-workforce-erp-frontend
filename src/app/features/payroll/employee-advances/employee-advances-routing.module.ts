import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeAdvancesListComponent } from './employee-advances-list/employee-advances-list.component';
import { EmployeeAdvancesDetailComponent } from './employee-advances-detail/employee-advances-detail.component';

const routes: Routes = [
  { path: '', component: EmployeeAdvancesListComponent },
  {
    path: ':id',
    data: { breadcrumb: 'Advance Details' },
    component: EmployeeAdvancesDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeeAdvancesRoutingModule {}
