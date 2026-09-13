import { Routes } from '@angular/router';

export const ATTENDANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./attendance-employee-list/attendance-employee-list.component').then(m => m.AttendanceEmployeeListComponent),
  },
  {
    path: 'register',
    data: { breadcrumb: 'Register Entry' },
    loadComponent: () =>
      import('./attendance-register/attendance-register.component').then(m => m.AttendanceRegisterComponent),
  },
  {
    // Legacy per-employee calendar URL — open the monthly register instead
    path: 'employees/:id',
    redirectTo: 'register',
    pathMatch: 'full',
  },
];
