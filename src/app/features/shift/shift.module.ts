import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ShiftModuleRoutingModule } from './shift-routing.module';
import { ShiftAssignComponent } from './shift-assign/shift-assign.component';
import { ShiftFormComponent } from './shift-form/shift-form.component';
import { ShiftListComponent } from './shift-list/shift-list.component';

@NgModule({
  declarations: [
    ShiftAssignComponent,
    ShiftFormComponent,
    ShiftListComponent,
  ],
  imports: [
    SharedModule,
    ShiftModuleRoutingModule,
  ],
})
export class ShiftModule {}
