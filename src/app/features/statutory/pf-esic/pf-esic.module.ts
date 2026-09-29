import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { PfEsicModuleRoutingModule } from './pf-esic-routing.module';
import { PfEsicBulkWizardComponent } from './pf-esic-bulk-wizard/pf-esic-bulk-wizard.component';
import { PfEsicDrawerComponent } from './pf-esic-drawer/pf-esic-drawer.component';
import { PfEsicListComponent } from './pf-esic-list/pf-esic-list.component';
import { ExportColumnsDialogComponent } from '../../../shared/components/export-columns-dialog/export-columns-dialog.component';

@NgModule({
  declarations: [
    PfEsicBulkWizardComponent,
    PfEsicDrawerComponent,
    PfEsicListComponent,
  ],
  imports: [
    SharedModule,
    PfEsicModuleRoutingModule,
    ExportColumnsDialogComponent,
  ],
})
export class PfEsicModule {}
