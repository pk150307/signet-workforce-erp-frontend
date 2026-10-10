import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AttendanceFormatterComponent } from './attendance-formatter/attendance-formatter.component';
import { DocumentFormatterRoutingModule } from './document-formatter-routing.module';

@NgModule({
  declarations: [AttendanceFormatterComponent],
  imports: [SharedModule, DocumentFormatterRoutingModule],
})
export class DocumentFormatterModule {}
