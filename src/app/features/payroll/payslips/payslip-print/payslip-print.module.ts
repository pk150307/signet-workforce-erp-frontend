import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { PayslipDocumentModule } from '../payslip-document/payslip-document.module';
import { PayslipPrintRoutingModule } from './payslip-print-routing.module';
import { PayslipPrintComponent } from './payslip-print.component';

@NgModule({
  declarations: [PayslipPrintComponent],
  imports: [SharedModule, PayslipPrintRoutingModule, PayslipDocumentModule],
})
export class PayslipPrintModule {}
