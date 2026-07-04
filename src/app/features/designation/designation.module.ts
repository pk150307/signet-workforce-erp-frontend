import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DesignationModuleRoutingModule } from './designation-routing.module';
import { DesignationDetailComponent } from './designation-detail/designation-detail.component';
import { DesignationFormComponent } from './designation-form/designation-form.component';
import { DesignationListComponent } from './designation-list/designation-list.component';

@NgModule({
  declarations: [
    DesignationDetailComponent,
    DesignationFormComponent,
    DesignationListComponent,
  ],
  imports: [
    SharedModule,
    DesignationModuleRoutingModule,
  ],
})
export class DesignationModule {}
