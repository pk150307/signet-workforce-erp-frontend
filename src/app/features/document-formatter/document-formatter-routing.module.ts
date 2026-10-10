import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendanceFormatterComponent } from './attendance-formatter/attendance-formatter.component';

const routes: Routes = [
  {
    path: '',
    component: AttendanceFormatterComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentFormatterRoutingModule {}
