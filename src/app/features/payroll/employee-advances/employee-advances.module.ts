import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { EmployeeAdvancesRoutingModule } from './employee-advances-routing.module';
import { EmployeeAdvancesListComponent } from './employee-advances-list/employee-advances-list.component';
import { EmployeeAdvancesDetailComponent } from './employee-advances-detail/employee-advances-detail.component';
import { EmployeeAdvancesGenerateDialogComponent } from './employee-advances-generate-dialog/employee-advances-generate-dialog.component';
import { EmployeeAdvancesPaymentsDialogComponent } from './employee-advances-payments-dialog/employee-advances-payments-dialog.component';
import { EmployeeAdvancesReopenDialogComponent } from './employee-advances-reopen-dialog/employee-advances-reopen-dialog.component';
import { ExportColumnsDialogComponent } from '../../../shared/components/export-columns-dialog/export-columns-dialog.component';

@NgModule({
  declarations: [
    EmployeeAdvancesListComponent,
    EmployeeAdvancesDetailComponent,
    EmployeeAdvancesGenerateDialogComponent,
    EmployeeAdvancesPaymentsDialogComponent,
    EmployeeAdvancesReopenDialogComponent,
  ],
  imports: [SharedModule, EmployeeAdvancesRoutingModule, ExportColumnsDialogComponent],
})
export class EmployeeAdvancesModule {}
