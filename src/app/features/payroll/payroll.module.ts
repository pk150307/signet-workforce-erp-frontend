import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { PayrollModuleRoutingModule } from './payroll-routing.module';
import { PayrollRunsComponent } from './payroll-runs/payroll-runs.component';

@NgModule({
  declarations: [PayrollRunsComponent],
  imports: [SharedModule, PayrollModuleRoutingModule],
})
export class PayrollModule {}
