import { Routes } from '@angular/router';

export const EMPLOYEES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./employee-dashboard/employee-dashboard.component').then(m => m.EmployeeDashboardComponent),
  },
  {
    path: 'list',
    data: { breadcrumb: 'All Employees' },
    loadComponent: () => import('./employee-list/employee-list.component').then(m => m.EmployeeListComponent),
  },
  {
    path: 'new',
    data: { breadcrumb: 'Add Employee' },
    loadComponent: () => import('./employee-form/employee-form.component').then(m => m.EmployeeFormComponent),
  },
  {
    path: ':id',
    data: { breadcrumb: 'Employee Profile' },
    loadComponent: () => import('./employee-detail/employee-detail.component').then(m => m.EmployeeDetailComponent),
  },
  {
    path: ':id/edit',
    data: { breadcrumb: 'Edit Employee' },
    loadComponent: () => import('./employee-form/employee-form.component').then(m => m.EmployeeFormComponent),
  },
];
