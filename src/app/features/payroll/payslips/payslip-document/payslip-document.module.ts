import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { PayslipDocumentComponent } from './payslip-document.component';

@NgModule({
  declarations: [PayslipDocumentComponent],
  imports: [SharedModule],
  exports: [PayslipDocumentComponent],
})
export class PayslipDocumentModule {}
