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
  {
    path: 'salary-register',
    data: { breadcrumb: { label: 'Salary Register', route: '/payroll/salary-register' } },
    loadChildren: () =>
      import('./salary-register/salary-register.module').then(m => m.SalaryRegisterModule),
  },
  {
    path: 'employee-advances',
    data: { breadcrumb: { label: 'Employee Advances', route: '/payroll/employee-advances' } },
    loadChildren: () =>
      import('./employee-advances/employee-advances.module').then(m => m.EmployeeAdvancesModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PayrollModuleRoutingModule {}
