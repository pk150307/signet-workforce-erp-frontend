import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { InvoicePrintComponent } from './invoice-print.component';

const routes: Routes = [{ path: '', component: InvoicePrintComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoicePrintRoutingModule {}
