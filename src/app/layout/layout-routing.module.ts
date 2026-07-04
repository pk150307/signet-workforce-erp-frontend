import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ShellComponent } from './shell/shell.component';

const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: 'dashboard',
        data: { breadcrumb: { label: 'Dashboard', route: '/dashboard' } },
        loadChildren: () => import('../features/dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      {
        path: 'employees',
        data: { breadcrumb: { label: 'Employees', route: '/employees' } },
        loadChildren: () => import('../features/employees/employees.module').then((m) => m.EmployeesModule),
      },
      {
        path: 'clients',
        data: { breadcrumb: { label: 'Clients', route: '/clients' } },
        loadChildren: () => import('../features/clients/clients.module').then((m) => m.ClientsModule),
      },
      {
        path: 'sites',
        data: { breadcrumb: { label: 'Sites', route: '/sites' } },
        loadChildren: () => import('../features/sites/sites.module').then((m) => m.SitesModule),
      },
      {
        path: 'attendance',
        data: { breadcrumb: { label: 'Attendance', route: '/attendance' } },
        loadChildren: () => import('../features/attendance/attendance.module').then((m) => m.AttendanceModule),
      },
      {
        path: 'leave',
        data: { breadcrumb: { label: 'Leave', route: '/leave' } },
        loadChildren: () => import('../features/leave/leave.module').then((m) => m.LeaveModule),
      },
      {
        path: 'payroll',
        data: { breadcrumb: { label: 'Payroll', route: '/payroll' } },
        loadChildren: () => import('../features/payroll/payroll.module').then((m) => m.PayrollModule),
      },
      {
        path: 'billing',
        data: { breadcrumb: { label: 'Billing', route: '/billing/dashboard' } },
        loadChildren: () => import('../features/billing/billing.module').then((m) => m.BillingModule),
      },
      {
        path: 'reports',
        data: { breadcrumb: { label: 'Reports', route: '/reports' } },
        loadChildren: () => import('../features/reports/reports.module').then((m) => m.ReportsModule),
      },
      {
        path: 'settings',
        data: { breadcrumb: { label: 'Settings', route: '/settings' } },
        loadChildren: () => import('../features/settings/settings.module').then((m) => m.SettingsModule),
      },
      {
        path: 'company',
        data: { breadcrumb: { label: 'Company', route: '/company' } },
        loadChildren: () => import('../features/company/company.module').then((m) => m.CompanyModule),
      },
      {
        path: 'departments',
        data: { breadcrumb: { label: 'Departments', route: '/departments' } },
        loadChildren: () => import('../features/department/department.module').then((m) => m.DepartmentModule),
      },
      {
        path: 'designations',
        data: { breadcrumb: { label: 'Designations', route: '/designations' } },
        loadChildren: () => import('../features/designation/designation.module').then((m) => m.DesignationModule),
      },
      {
        path: 'shifts',
        data: { breadcrumb: { label: 'Shifts', route: '/shifts' } },
        loadChildren: () => import('../features/shift/shift.module').then((m) => m.ShiftModule),
      },
      {
        path: 'statutory/pf-esic',
        data: { breadcrumb: { label: 'PF / ESIC', route: '/statutory/pf-esic' } },
        loadChildren: () => import('../features/statutory/pf-esic/pf-esic.module').then((m) => m.PfEsicModule),
      },
      {
        path: 'unauthorized',
        data: { breadcrumb: 'Unauthorized' },
        loadChildren: () => import('../pages/pages.module').then((m) => m.PagesModule),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutRoutingModule {}
