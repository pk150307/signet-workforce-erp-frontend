import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PayslipPrintComponent } from './payslip-print.component';

const routes: Routes = [{ path: '', component: PayslipPrintComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PayslipPrintRoutingModule {}
