import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { PfEsicModuleRoutingModule } from './pf-esic-routing.module';
import { PfEsicBulkWizardComponent } from './pf-esic-bulk-wizard/pf-esic-bulk-wizard.component';
import { PfEsicDrawerComponent } from './pf-esic-drawer/pf-esic-drawer.component';
import { PfEsicListComponent } from './pf-esic-list/pf-esic-list.component';

@NgModule({
  declarations: [
    PfEsicBulkWizardComponent,
    PfEsicDrawerComponent,
    PfEsicListComponent,
  ],
  imports: [
    SharedModule,
    PfEsicModuleRoutingModule,
  ],
})
export class PfEsicModule {}
