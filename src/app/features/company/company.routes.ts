import { Routes } from '@angular/router';

export const COMPANY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./company-profile/company-profile.component').then(m => m.CompanyProfileComponent),
  },
  {
    path: 'branches',
    loadComponent: () => import('./branches-list/branches-list.component').then(m => m.BranchesListComponent),
  },
  {
    path: 'offices',
    loadComponent: () => import('./offices-list/offices-list.component').then(m => m.OfficesListComponent),
  },
];
