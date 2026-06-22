import { Routes } from '@angular/router';

export const SHIFT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./shift-list/shift-list.component').then(m => m.ShiftListComponent),
  },
  {
    path: 'new',
    data: { breadcrumb: 'Add Shift' },
    loadComponent: () => import('./shift-form/shift-form.component').then(m => m.ShiftFormComponent),
  },
  {
    path: 'assign',
    data: { breadcrumb: 'Assign Shift' },
    loadComponent: () => import('./shift-assign/shift-assign.component').then(m => m.ShiftAssignComponent),
  },
  {
    path: ':id/edit',
    data: { breadcrumb: 'Edit Shift' },
    loadComponent: () => import('./shift-form/shift-form.component').then(m => m.ShiftFormComponent),
  },
];
