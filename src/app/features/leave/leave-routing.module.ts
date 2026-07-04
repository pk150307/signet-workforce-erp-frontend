import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeaveDashboardComponent } from './leave-dashboard/leave-dashboard.component';
import { LeaveTypesComponent } from './leave-types/leave-types.component';
import { ApplyLeaveComponent } from './apply-leave/apply-leave.component';
import { LeaveApprovalComponent } from './leave-approval/leave-approval.component';
import { LeaveBalanceComponent } from './leave-balance/leave-balance.component';
import { LeaveCalendarComponent } from './leave-calendar/leave-calendar.component';

const routes: Routes = [
  {
    path: '',
    component: LeaveDashboardComponent,
  },
  {
    path: 'types',
    data: { breadcrumb: 'Leave Types' },
    component: LeaveTypesComponent,
  },
  {
    path: 'apply',
    data: { breadcrumb: 'Apply Leave' },
    component: ApplyLeaveComponent,
  },
  {
    path: 'approval',
    data: { breadcrumb: 'Approvals' },
    component: LeaveApprovalComponent,
  },
  {
    path: 'balance',
    data: { breadcrumb: 'Leave Balance' },
    component: LeaveBalanceComponent,
  },
  {
    path: 'calendar',
    data: { breadcrumb: 'Calendar' },
    component: LeaveCalendarComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeaveModuleRoutingModule {}
