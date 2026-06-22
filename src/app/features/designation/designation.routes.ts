import { Routes } from '@angular/router';

export const DESIGNATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./designation-list/designation-list.component').then(m => m.DesignationListComponent),
  },
  {
    path: 'new',
    data: { breadcrumb: 'Add Designation' },
    loadComponent: () => import('./designation-form/designation-form.component').then(m => m.DesignationFormComponent),
  },
  {
    path: ':id/edit',
    data: { breadcrumb: 'Edit Designation' },
    loadComponent: () => import('./designation-form/designation-form.component').then(m => m.DesignationFormComponent),
  },
  {
    path: ':id',
    data: { breadcrumb: 'Designation Details' },
    loadComponent: () => import('./designation-detail/designation-detail.component').then(m => m.DesignationDetailComponent),
  },
];
