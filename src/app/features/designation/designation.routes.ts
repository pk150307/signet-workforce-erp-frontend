import { Routes } from '@angular/router';

export const DESIGNATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./designation-list/designation-list.component').then(m => m.DesignationListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./designation-form/designation-form.component').then(m => m.DesignationFormComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./designation-form/designation-form.component').then(m => m.DesignationFormComponent),
  },
];
