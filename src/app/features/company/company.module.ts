import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CompanyModuleRoutingModule } from './company-routing.module';
import { BranchFormDialogComponent } from './branch-form-dialog/branch-form-dialog.component';
import { BranchesListComponent } from './branches-list/branches-list.component';
import { CompanyProfileComponent } from './company-profile/company-profile.component';
import { OfficeFormDialogComponent } from './office-form-dialog/office-form-dialog.component';
import { OfficesListComponent } from './offices-list/offices-list.component';

@NgModule({
  declarations: [
    BranchFormDialogComponent,
    BranchesListComponent,
    CompanyProfileComponent,
    OfficeFormDialogComponent,
    OfficesListComponent,
  ],
  imports: [
    SharedModule,
    CompanyModuleRoutingModule,
  ],
})
export class CompanyModule {}
