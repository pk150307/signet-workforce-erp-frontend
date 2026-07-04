import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PayslipListComponent } from './payslip-list/payslip-list.component';
import { PayslipGenerateComponent } from './payslip-generate/payslip-generate.component';
import { PayslipDetailComponent } from './payslip-detail/payslip-detail.component';

const routes: Routes = [
  {
    path: '',
    component: PayslipListComponent,
  },
  {
    path: 'generate',
    data: { breadcrumb: 'Generate Payslips' },
    component: PayslipGenerateComponent,
  },
  {
    path: ':id',
    data: { breadcrumb: 'Payslip Details' },
    component: PayslipDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PayslipsModuleRoutingModule {}
