import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalaryRegisterListComponent } from './salary-register-list/salary-register-list.component';
import { SalaryRegisterDetailComponent } from './salary-register-detail/salary-register-detail.component';

const routes: Routes = [
  {
    path: '',
    component: SalaryRegisterListComponent,
  },
  {
    path: ':id',
    data: { breadcrumb: 'Register Details' },
    component: SalaryRegisterDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalaryRegisterRoutingModule {}
