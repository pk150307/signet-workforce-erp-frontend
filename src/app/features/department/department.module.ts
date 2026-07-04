import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DepartmentModuleRoutingModule } from './department-routing.module';
import { DepartmentDetailComponent } from './department-detail/department-detail.component';
import { DepartmentFormComponent } from './department-form/department-form.component';
import { DepartmentListComponent } from './department-list/department-list.component';

@NgModule({
  declarations: [
    DepartmentDetailComponent,
    DepartmentFormComponent,
    DepartmentListComponent,
  ],
  imports: [
    SharedModule,
    DepartmentModuleRoutingModule,
  ],
})
export class DepartmentModule {}
