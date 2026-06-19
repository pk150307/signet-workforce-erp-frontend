import { Routes } from '@angular/router';

export const LEAVE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./leave-dashboard/leave-dashboard.component').then(m => m.LeaveDashboardComponent),
  },
  {
    path: 'types',
    loadComponent: () => import('./leave-types/leave-types.component').then(m => m.LeaveTypesComponent),
  },
  {
    path: 'apply',
    loadComponent: () => import('./apply-leave/apply-leave.component').then(m => m.ApplyLeaveComponent),
  },
  {
    path: 'approval',
    loadComponent: () => import('./leave-approval/leave-approval.component').then(m => m.LeaveApprovalComponent),
  },
  {
    path: 'balance',
    loadComponent: () => import('./leave-balance/leave-balance.component').then(m => m.LeaveBalanceComponent),
  },
  {
    path: 'calendar',
    loadComponent: () => import('./leave-calendar/leave-calendar.component').then(m => m.LeaveCalendarComponent),
  },
];
