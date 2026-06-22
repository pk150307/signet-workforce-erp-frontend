import { Routes } from '@angular/router';

export const COMPANY_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'Profile' },
    loadComponent: () => import('./company-profile/company-profile.component').then(m => m.CompanyProfileComponent),
  },
  {
    path: 'branches',
    data: { breadcrumb: 'Branches' },
    loadComponent: () => import('./branches-list/branches-list.component').then(m => m.BranchesListComponent),
  },
  {
    path: 'offices',
    data: { breadcrumb: 'Offices' },
    loadComponent: () => import('./offices-list/offices-list.component').then(m => m.OfficesListComponent),
  },
];
