import { Routes } from '@angular/router';

export const LAYOUT_ROUTES: Routes = [
  {
    path: 'dashboard',
    data: { breadcrumb: { label: 'Dashboard', route: '/dashboard' } },
    loadChildren: () => import('../features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
  },
  {
    path: 'employees',
    data: { breadcrumb: { label: 'Employees', route: '/employees' } },
    loadChildren: () => import('../features/employees/employees.routes').then(m => m.EMPLOYEES_ROUTES),
  },
  {
    path: 'clients',
    data: { breadcrumb: { label: 'Clients', route: '/clients' } },
    loadChildren: () => import('../features/clients/clients.routes').then(m => m.CLIENTS_ROUTES),
  },
  {
    path: 'sites',
    data: { breadcrumb: { label: 'Sites', route: '/sites' } },
    loadChildren: () => import('../features/sites/sites.routes').then(m => m.SITES_ROUTES),
  },
  {
    path: 'attendance',
    data: { breadcrumb: { label: 'Attendance', route: '/attendance' } },
    loadChildren: () => import('../features/attendance/attendance.routes').then(m => m.ATTENDANCE_ROUTES),
  },
  {
    path: 'leave',
    data: { breadcrumb: { label: 'Leave', route: '/leave' } },
    loadChildren: () => import('../features/leave/leave.routes').then(m => m.LEAVE_ROUTES),
  },
  {
    path: 'payroll',
    data: { breadcrumb: { label: 'Payroll', route: '/payroll' } },
    loadChildren: () => import('../features/payroll/payroll.routes').then(m => m.PAYROLL_ROUTES),
  },
  {
    path: 'billing',
    data: { breadcrumb: { label: 'Billing', route: '/billing/dashboard' } },
    loadChildren: () => import('../features/billing/billing.routes').then(m => m.BILLING_ROUTES),
  },
  {
    path: 'reports',
    data: { breadcrumb: { label: 'Reports', route: '/reports' } },
    loadChildren: () => import('../features/reports/reports.routes').then(m => m.REPORTS_ROUTES),
  },
  {
    path: 'settings',
    data: { breadcrumb: { label: 'Settings', route: '/settings' } },
    loadChildren: () => import('../features/settings/settings.routes').then(m => m.SETTINGS_ROUTES),
  },
  {
    path: 'company',
    data: { breadcrumb: { label: 'Company', route: '/company' } },
    loadChildren: () => import('../features/company/company.routes').then(m => m.COMPANY_ROUTES),
  },
  {
    path: 'departments',
    data: { breadcrumb: { label: 'Departments', route: '/departments' } },
    loadChildren: () => import('../features/department/department.routes').then(m => m.DEPARTMENT_ROUTES),
  },
  {
    path: 'designations',
    data: { breadcrumb: { label: 'Designations', route: '/designations' } },
    loadChildren: () => import('../features/designation/designation.routes').then(m => m.DESIGNATION_ROUTES),
  },
  {
    path: 'shifts',
    data: { breadcrumb: { label: 'Shifts', route: '/shifts' } },
    loadChildren: () => import('../features/shift/shift.routes').then(m => m.SHIFT_ROUTES),
  },
  {
    path: 'statutory/pf-esic',
    data: { breadcrumb: { label: 'PF / ESIC', route: '/statutory/pf-esic' } },
    loadChildren: () => import('../features/statutory/pf-esic/pf-esic.routes').then(m => m.PF_ESIC_ROUTES),
  },
  {
    path: 'unauthorized',
    data: { breadcrumb: 'Unauthorized' },
    loadComponent: () => import('../pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
