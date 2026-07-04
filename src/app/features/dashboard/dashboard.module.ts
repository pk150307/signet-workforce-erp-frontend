import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DashboardModuleRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [
    DashboardComponent,
  ],
  imports: [
    SharedModule,
    DashboardModuleRoutingModule,
  ],
})
export class DashboardModule {}
