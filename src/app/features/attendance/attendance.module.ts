import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AttendanceModuleRoutingModule } from './attendance-routing.module';
import { AttendanceCalendarComponent } from './attendance-calendar/attendance-calendar.component';
import { AttendanceCorrectionComponent } from './attendance-correction/attendance-correction.component';
import { AttendanceDashboardComponent } from './attendance-dashboard/attendance-dashboard.component';
import { AttendanceEmployeeDetailComponent } from './attendance-employee-detail/attendance-employee-detail.component';
import { AttendanceEmployeeListComponent } from './attendance-employee-list/attendance-employee-list.component';
import { AttendanceRegisterComponent } from './attendance-register/attendance-register.component';
import { DailyAttendanceComponent } from './daily-attendance/daily-attendance.component';
import { MonthlyAttendanceComponent } from './monthly-attendance/monthly-attendance.component';

@NgModule({
  declarations: [
    AttendanceCalendarComponent,
    AttendanceCorrectionComponent,
    AttendanceDashboardComponent,
    AttendanceEmployeeDetailComponent,
    AttendanceEmployeeListComponent,
    AttendanceRegisterComponent,
    DailyAttendanceComponent,
    MonthlyAttendanceComponent,
  ],
  imports: [
    SharedModule,
    AttendanceModuleRoutingModule,
  ],
})
export class AttendanceModule {}
