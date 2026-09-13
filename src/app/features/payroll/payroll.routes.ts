import { Routes } from '@angular/router';

export const PAYROLL_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'Payroll Runs' },
    loadComponent: () => import('./payroll-runs/payroll-runs.component').then(m => m.PayrollRunsComponent),
  },
  {
    path: 'payslips',
    data: { breadcrumb: { label: 'Salary Slips', route: '/payroll/payslips' } },
    loadChildren: () => import('./payslips/payslips.routes').then(m => m.PAYSLIP_ROUTES),
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
