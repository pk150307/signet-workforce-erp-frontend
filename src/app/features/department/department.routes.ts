import { Routes } from '@angular/router';

export const DEPARTMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./department-list/department-list.component').then(m => m.DepartmentListComponent),
  },
  {
    path: 'new',
    data: { breadcrumb: 'Add Department' },
    loadComponent: () => import('./department-form/department-form.component').then(m => m.DepartmentFormComponent),
  },
  {
    path: ':id/edit',
    data: { breadcrumb: 'Edit Department' },
    loadComponent: () => import('./department-form/department-form.component').then(m => m.DepartmentFormComponent),
  },
  {
    path: ':id',
    data: { breadcrumb: 'Department Details' },
    loadComponent: () => import('./department-detail/department-detail.component').then(m => m.DepartmentDetailComponent),
  },
];
