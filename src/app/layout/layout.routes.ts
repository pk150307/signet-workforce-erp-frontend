import { Routes } from '@angular/router';

export const LAYOUT_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('../features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
  },
  {
    path: 'employees',
    loadChildren: () => import('../features/employees/employees.routes').then(m => m.EMPLOYEES_ROUTES),
  },
  {
    path: 'clients',
    loadChildren: () => import('../features/clients/clients.routes').then(m => m.CLIENTS_ROUTES),
  },
  {
    path: 'sites',
    loadChildren: () => import('../features/sites/sites.routes').then(m => m.SITES_ROUTES),
  },
  {
    path: 'attendance',
    loadChildren: () => import('../features/attendance/attendance.routes').then(m => m.ATTENDANCE_ROUTES),
  },
  {
    path: 'leave',
    loadChildren: () => import('../features/leave/leave.routes').then(m => m.LEAVE_ROUTES),
  },
  {
    path: 'payroll',
    loadChildren: () => import('../features/payroll/payroll.routes').then(m => m.PAYROLL_ROUTES),
  },
  {
    path: 'billing',
    loadChildren: () => import('../features/billing/billing.routes').then(m => m.BILLING_ROUTES),
  },
  {
    path: 'reports',
    loadChildren: () => import('../features/reports/reports.routes').then(m => m.REPORTS_ROUTES),
  },
  {
    path: 'settings',
    loadChildren: () => import('../features/settings/settings.routes').then(m => m.SETTINGS_ROUTES),
  },
  {
    path: 'company',
    loadChildren: () => import('../features/company/company.routes').then(m => m.COMPANY_ROUTES),
  },
  {
    path: 'departments',
    loadChildren: () => import('../features/department/department.routes').then(m => m.DEPARTMENT_ROUTES),
  },
  {
    path: 'designations',
    loadChildren: () => import('../features/designation/designation.routes').then(m => m.DESIGNATION_ROUTES),
  },
  {
    path: 'shifts',
    loadChildren: () => import('../features/shift/shift.routes').then(m => m.SHIFT_ROUTES),
  },
  {
    path: 'statutory/pf-esic',
    loadChildren: () => import('../features/statutory/pf-esic/pf-esic.routes').then(m => m.PF_ESIC_ROUTES),
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('../pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
