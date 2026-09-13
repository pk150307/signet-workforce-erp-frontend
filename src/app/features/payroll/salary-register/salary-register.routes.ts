import { Routes } from '@angular/router';

export const SALARY_REGISTER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./salary-register-list/salary-register-list.component').then(
        m => m.SalaryRegisterListComponent,
      ),
  },
  {
    path: ':id',
    data: { breadcrumb: 'Register Details' },
    loadComponent: () =>
      import('./salary-register-detail/salary-register-detail.component').then(
        m => m.SalaryRegisterDetailComponent,
      ),
  },
];
