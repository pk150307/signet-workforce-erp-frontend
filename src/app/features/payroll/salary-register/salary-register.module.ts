import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { SalaryRegisterRoutingModule } from './salary-register-routing.module';
import { SalaryRegisterListComponent } from './salary-register-list/salary-register-list.component';
import { SalaryRegisterDetailComponent } from './salary-register-detail/salary-register-detail.component';
import { SalaryRegisterGenerateDialogComponent } from './salary-register-generate-dialog/salary-register-generate-dialog.component';
import { SalaryRegisterEditRowDialogComponent } from './salary-register-edit-row-dialog/salary-register-edit-row-dialog.component';
import { SalaryRegisterReopenDialogComponent } from './salary-register-reopen-dialog/salary-register-reopen-dialog.component';

@NgModule({
  declarations: [
    SalaryRegisterListComponent,
    SalaryRegisterDetailComponent,
    SalaryRegisterGenerateDialogComponent,
    SalaryRegisterEditRowDialogComponent,
    SalaryRegisterReopenDialogComponent,
  ],
  imports: [SharedModule, SalaryRegisterRoutingModule],
})
export class SalaryRegisterModule {}
