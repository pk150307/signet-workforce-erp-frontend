import { Routes } from '@angular/router';

export const LEAVE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./leave-dashboard/leave-dashboard.component').then(m => m.LeaveDashboardComponent),
  },
  {
    path: 'types',
    data: { breadcrumb: 'Leave Types' },
    loadComponent: () => import('./leave-types/leave-types.component').then(m => m.LeaveTypesComponent),
  },
  {
    path: 'apply',
    data: { breadcrumb: 'Apply Leave' },
    loadComponent: () => import('./apply-leave/apply-leave.component').then(m => m.ApplyLeaveComponent),
  },
  {
    path: 'approval',
    data: { breadcrumb: 'Approvals' },
    loadComponent: () => import('./leave-approval/leave-approval.component').then(m => m.LeaveApprovalComponent),
  },
  {
    path: 'balance',
    data: { breadcrumb: 'Leave Balance' },
    loadComponent: () => import('./leave-balance/leave-balance.component').then(m => m.LeaveBalanceComponent),
  },
  {
    path: 'calendar',
    data: { breadcrumb: 'Calendar' },
    loadComponent: () => import('./leave-calendar/leave-calendar.component').then(m => m.LeaveCalendarComponent),
  },
];
