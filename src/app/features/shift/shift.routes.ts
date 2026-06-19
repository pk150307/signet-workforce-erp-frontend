import { Routes } from '@angular/router';

export const SHIFT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./shift-list/shift-list.component').then(m => m.ShiftListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./shift-form/shift-form.component').then(m => m.ShiftFormComponent),
  },
  {
    path: 'assign',
    loadComponent: () => import('./shift-assign/shift-assign.component').then(m => m.ShiftAssignComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./shift-form/shift-form.component').then(m => m.ShiftFormComponent),
  },
];
