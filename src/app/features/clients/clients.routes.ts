import { Routes } from '@angular/router';

export const CLIENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./client-list/client-list.component').then(m => m.ClientListComponent),
  },
  {
    path: 'new',
    data: { breadcrumb: 'Add Client' },
    loadComponent: () => import('./client-form/client-form.component').then(m => m.ClientFormComponent),
  },
  {
    path: ':id/edit',
    data: { breadcrumb: 'Edit Client' },
    loadComponent: () => import('./client-form/client-form.component').then(m => m.ClientFormComponent),
  },
  {
    path: ':id',
    data: { breadcrumb: 'Client Details' },
    loadComponent: () => import('./client-detail/client-detail.component').then(m => m.ClientDetailComponent),
  },
];
