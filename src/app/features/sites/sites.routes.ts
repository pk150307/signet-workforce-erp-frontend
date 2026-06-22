import { Routes } from '@angular/router';

export const SITES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./site-list/site-list.component').then(m => m.SiteListComponent),
  },
  {
    path: 'new',
    data: { breadcrumb: 'Add Site' },
    loadComponent: () => import('./site-form/site-form.component').then(m => m.SiteFormComponent),
  },
  {
    path: 'dashboard',
    data: { breadcrumb: 'Dashboard' },
    loadComponent: () => import('./site-dashboard/site-dashboard.component').then(m => m.SiteDashboardComponent),
  },
  {
    path: ':id/edit',
    data: { breadcrumb: 'Edit Site' },
    loadComponent: () => import('./site-form/site-form.component').then(m => m.SiteFormComponent),
  },
  {
    path: ':id',
    data: { breadcrumb: 'Site Details' },
    loadComponent: () => import('./site-detail/site-detail.component').then(m => m.SiteDetailComponent),
  },
];
