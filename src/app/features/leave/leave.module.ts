import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { LeaveModuleRoutingModule } from './leave-routing.module';
import { ApplyLeaveComponent } from './apply-leave/apply-leave.component';
import { LeaveApprovalComponent } from './leave-approval/leave-approval.component';
import { LeaveBalanceComponent } from './leave-balance/leave-balance.component';
import { LeaveCalendarComponent } from './leave-calendar/leave-calendar.component';
import { LeaveDashboardComponent } from './leave-dashboard/leave-dashboard.component';
import { LeaveTypesComponent } from './leave-types/leave-types.component';

@NgModule({
  declarations: [
    ApplyLeaveComponent,
    LeaveApprovalComponent,
    LeaveBalanceComponent,
    LeaveCalendarComponent,
    LeaveDashboardComponent,
    LeaveTypesComponent,
  ],
  imports: [
    SharedModule,
    LeaveModuleRoutingModule,
  ],
})
export class LeaveModule {}
