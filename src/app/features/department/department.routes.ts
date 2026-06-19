import { Routes } from '@angular/router';

export const DEPARTMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./department-list/department-list.component').then(m => m.DepartmentListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./department-form/department-form.component').then(m => m.DepartmentFormComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./department-form/department-form.component').then(m => m.DepartmentFormComponent),
  },
];
