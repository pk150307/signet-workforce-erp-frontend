import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { PayslipsModuleRoutingModule } from './payslips-routing.module';
import { PayslipDetailComponent } from './payslip-detail/payslip-detail.component';
import { PayslipDocumentModule } from './payslip-document/payslip-document.module';
import { PayslipGenerateComponent } from './payslip-generate/payslip-generate.component';
import { PayslipListComponent } from './payslip-list/payslip-list.component';

@NgModule({
  declarations: [
    PayslipDetailComponent,
    PayslipGenerateComponent,
    PayslipListComponent,
  ],
  imports: [
    SharedModule,
    PayslipsModuleRoutingModule,
    PayslipDocumentModule,
  ],
})
export class PayslipsModule {}
