import { Routes } from '@angular/router';

export const SITES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./site-list/site-list.component').then(m => m.SiteListComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./site-dashboard/site-dashboard.component').then(m => m.SiteDashboardComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./site-detail/site-detail.component').then(m => m.SiteDetailComponent),
  },
];
