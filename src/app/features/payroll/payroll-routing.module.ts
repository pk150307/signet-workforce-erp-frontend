import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PayrollRunsComponent } from './payroll-runs/payroll-runs.component';

const routes: Routes = [
  {
    path: '',
    data: { breadcrumb: 'Payroll Runs' },
    component: PayrollRunsComponent,
  },
  {
    path: 'payslips',
    data: { breadcrumb: { label: 'Salary Slips', route: '/payroll/payslips' } },
    loadChildren: () => import('./payslips/payslips.module').then(m => m.PayslipsModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PayrollModuleRoutingModule {}
