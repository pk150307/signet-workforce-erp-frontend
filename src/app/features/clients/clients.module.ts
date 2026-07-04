import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ClientsModuleRoutingModule } from './clients-routing.module';
import { ClientDetailComponent } from './client-detail/client-detail.component';
import { ClientFormComponent } from './client-form/client-form.component';
import { ClientListComponent } from './client-list/client-list.component';

@NgModule({
  declarations: [
    ClientDetailComponent,
    ClientFormComponent,
    ClientListComponent,
  ],
  imports: [
    SharedModule,
    ClientsModuleRoutingModule,
  ],
})
export class ClientsModule {}
